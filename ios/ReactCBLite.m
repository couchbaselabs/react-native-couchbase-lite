//
//  CouchbaseLite.m
//  CouchbaseLite
//
//  Created by James Nocentini on 02/12/2015.
//  Copyright © 2015 Couchbase. All rights reserved.
//

#import "ReactCBLite.h"

#import "RCTLog.h"

#import "CouchbaseLite/CouchbaseLite.h"
#import "CouchbaseLiteListener/CouchbaseLiteListener.h"
#import "CBLRegisterJSViewCompiler.h"
#import <AssetsLibrary/AssetsLibrary.h>

@implementation ReactCBLite

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(float)port username:(NSString *)username password:(NSString *)password callback:(RCTResponseSenderBlock)callback)
{
    NSLog(@"Launching Couchbase Lite...");
    CBLManager* dbmgr = [CBLManager sharedInstance];
    CBLRegisterJSViewCompiler();
    
    CBLListener* listener = [[CBLListener alloc] initWithManager:dbmgr port:port];
    [listener setPasswords:@{username: password}];
    [listener start:nil];
    
    NSLog(@"Couchbase Lite url = %@", listener.URL);
    callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(upload:(NSString *)method
                  authHeader:(NSString *)authHeader
                  sourceUri:(NSString *)sourceUri
                  targetUri:(NSString *)targetUri
                  contentType:(NSString *)contentType
                  callback:(RCTResponseSenderBlock)callback)
{
    
    if([sourceUri hasPrefix:@"assets-library"]){
        NSLog(@"Uploading attachment from asset %@ to %@", sourceUri, targetUri);
        
        // thanks to
        // * https://github.com/kamilkp/react-native-file-transfer/blob/master/RCTFileTransfer.m
        // * http://stackoverflow.com/questions/26057394/how-to-convert-from-alassets-to-nsdata
        
        ALAssetsLibrary *library = [[ALAssetsLibrary alloc] init];
        
        [library assetForURL:[NSURL URLWithString:sourceUri] resultBlock:^(ALAsset *asset) {
            
            ALAssetRepresentation *rep = [asset defaultRepresentation];
            
            Byte *buffer = (Byte*)malloc(rep.size);
            NSUInteger buffered = [rep getBytes:buffer fromOffset:0.0 length:rep.size error:nil];
            NSData *data = [NSData dataWithBytesNoCopy:buffer length:buffered freeWhenDone:YES];
            
            [self sendData:method authHeader:authHeader data:data targetUri:targetUri contentType:contentType callback:callback];
        } failureBlock:^(NSError *error) {
            NSLog(@"Error: %@",[error localizedDescription]);
            NSMutableDictionary* returnStuff = [NSMutableDictionary dictionary];
            [returnStuff setObject: [error localizedDescription] forKey:@"error"];
            callback(@[returnStuff, [NSNull null]]);
        }];
    } else if ([sourceUri isAbsolutePath]) {
        NSLog(@"Uploading attachment from file %@ to %@", sourceUri, targetUri);
        NSData *data = [NSData dataWithContentsOfFile:sourceUri];
        [self sendData:method authHeader:authHeader data:data targetUri:targetUri contentType:contentType callback:callback];
    } else {
        NSLog(@"Uploading attachment from uri %@ to %@", sourceUri, targetUri);
        NSData *data = [NSData dataWithContentsOfURL:[NSURL URLWithString:sourceUri]];
        [self sendData:method authHeader:authHeader data:data targetUri:targetUri contentType:contentType callback:callback];
    }
}

- (void) sendData:(NSString *)method
       authHeader:(NSString *)authHeader
             data:(NSData *)data
        targetUri:(NSString *)targetUri
      contentType:(NSString *)contentType
         callback:(RCTResponseSenderBlock)callback
{
    NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:targetUri]];
    
    [request setHTTPMethod:method];
    [request setValue:contentType forHTTPHeaderField:@"Content-Type"];
    [request setValue:authHeader forHTTPHeaderField:@"Authorization"];
    [request setHTTPBody:data];
    
    NSMutableDictionary* returnStuff = [NSMutableDictionary dictionary];
    
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        
        NSURLResponse *response;
        NSError *error = nil;
        NSData *receivedData = [NSURLConnection sendSynchronousRequest:request returningResponse:&response error:&error];
        
        if (error) {
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)response;
                
                NSLog(@"HTTP Error: %ld %@", (long)httpResponse.statusCode, error);
                
                [returnStuff setObject: error forKey:@"error"];
                [returnStuff setObject: [NSNumber numberWithFloat:httpResponse.statusCode] forKey:@"statusCode"];
            } else {
                NSLog(@"Error %@", error);
                [returnStuff setObject: error forKey:@"error"];
            }
            
            callback(@[returnStuff, [NSNull null]]);
        } else {
            NSString *responeString = [[NSString alloc] initWithData:receivedData encoding:NSUTF8StringEncoding];
            NSLog(@"responeString %@", responeString);
            
            NSData *data = [responeString dataUsingEncoding:NSUTF8StringEncoding];
            id json = [NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
            
            [returnStuff setObject: json forKey:@"resp"];
            
            if ([response isKindOfClass:[NSHTTPURLResponse class]]) {
                NSHTTPURLResponse *httpResponse = (NSHTTPURLResponse*)response;
                NSLog(@"status code %ld", (long)httpResponse.statusCode);
                
                [returnStuff setObject: [NSNumber numberWithFloat:httpResponse.statusCode] forKey:@"statusCode"];
            }
            
            callback(@[[NSNull null], returnStuff]);
        }
    });
}

@end
