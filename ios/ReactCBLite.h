//
//  CouchbaseLite.h
//  CouchbaseLite
//
//  Created by James Nocentini on 02/12/2015.
//  Copyright © 2015 Couchbase. All rights reserved.
//

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import "RCTBridgeModule.h"
#endif
#import <CouchbaseLite/CouchbaseLite.h>
#import <CouchbaseLiteListener/CBLListener.h>

@interface ReactCBLite : NSObject <RCTBridgeModule>
{
    CBLListener *listener;
    CBLManager *manager;
}
@end
