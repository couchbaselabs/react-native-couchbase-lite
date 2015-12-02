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

@implementation ReactCBLite

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(float)port username:(NSString *)username password:(NSString *)password)
{
    NSLog(@"Launching Couchbase Lite...");
    CBLManager* dbmgr = [CBLManager sharedInstance];
    CBLRegisterJSViewCompiler();
    
    CBLListener* listener = [[CBLListener alloc] initWithManager:dbmgr port:port];
//    [listener setPasswords:@{username: password}];
    [listener start:nil];
    
    NSLog(@"Couchbase Lite url = %@", listener.URL);
}

@end
