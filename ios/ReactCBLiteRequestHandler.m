//
//  ReactCBLiteRequestHandler.m
//  ReactCBLite
//
//  Created by Yonah Forst on 22/07/16.
//  Copyright © 2016 Couchbase. All rights reserved.
//

#import "ReactCBLiteRequestHandler.h"


@interface ReactCBLiteRequestHandler () <NSURLSessionDataDelegate>

@end

@implementation ReactCBLiteRequestHandler
{
    NSMapTable *_delegates;
    NSURLSession *_session;
}

RCT_EXPORT_MODULE()

- (void)invalidate
{
    [_session invalidateAndCancel];
    _session = nil;
}

- (BOOL)isValid
{
    // if session == nil and delegates != nil, we've been invalidated
    return _session || !_delegates;
}

#pragma mark - NSURLRequestHandler

// idealy we should pass this off to [CBL_URLProtocol handlesURL:] but we dont have access to it from here.
// is this way ok?
- (BOOL)canHandleRequest:(NSURLRequest *)request
{
    return [request.URL.host hasSuffix: @".couchbase."];
}

//set handler priority because we know we want to be the ones to handle couchbase http requests
-(float)handlerPriority
{
    return 10.0;
}

- (NSURLSessionDataTask *)sendRequest:(NSURLRequest *)request
                         withDelegate:(id<RCTURLRequestDelegate>)delegate
{
    // Lazy setup
    if (!_session && [self isValid]) {
        
        NSOperationQueue *callbackQueue = [NSOperationQueue new];
        callbackQueue.maxConcurrentOperationCount = 1;
        NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
        
        // Register Couchbase Lite's NSURLProtocol. This allows CBL to handle HTTP requests made by this
        // session that target the internalURL of a CBLManager.
        Class cblURLProtocol = NSClassFromString(@"CBL_URLProtocol");
        if (cblURLProtocol)
            configuration.protocolClasses = @[cblURLProtocol];
        
        _session = [NSURLSession sessionWithConfiguration:configuration
                                                 delegate:self
                                            delegateQueue:callbackQueue];
        
        _delegates = [[NSMapTable alloc] initWithKeyOptions:NSPointerFunctionsStrongMemory
                                               valueOptions:NSPointerFunctionsStrongMemory
                                                   capacity:0];
    }
    
    NSURLSessionDataTask *task = [_session dataTaskWithRequest:request];
    [_delegates setObject:delegate forKey:task];
    [task resume];
    return task;
}

- (void)cancelRequest:(NSURLSessionDataTask *)task
{
    [task cancel];
    [_delegates removeObjectForKey:task];
}

#pragma mark - NSURLSession delegate

- (void)URLSession:(NSURLSession *)session
              task:(NSURLSessionTask *)task
   didSendBodyData:(int64_t)bytesSent
    totalBytesSent:(int64_t)totalBytesSent
totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend
{
    [[_delegates objectForKey:task] URLRequest:task didSendDataWithProgress:totalBytesSent];
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)task
didReceiveResponse:(NSURLResponse *)response
 completionHandler:(void (^)(NSURLSessionResponseDisposition))completionHandler
{
    [[_delegates objectForKey:task] URLRequest:task didReceiveResponse:response];
    completionHandler(NSURLSessionResponseAllow);
}

- (void)URLSession:(NSURLSession *)session
          dataTask:(NSURLSessionDataTask *)task
    didReceiveData:(NSData *)data
{
    [[_delegates objectForKey:task] URLRequest:task didReceiveData:data];
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error
{
    [[_delegates objectForKey:task] URLRequest:task didCompleteWithError:error];
    [_delegates removeObjectForKey:task];
}

@end
