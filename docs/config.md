# Configuration file
Below is a description of each relevant property in [config.json](https://github.com/ovanta/vue-cloudfront-api/blob/master/config/config.json) which 
is used to define general behaviour of the official vue-cloudfront api.

**`demo`**  
If true all files will be saved, but no bytes written into it. Used to show a demo without consuming storage space.
See `demoContent` to configure which content should be send as placeholder.

**`server.port`**  
Port where vue-cloudfront-api will listen for requests.

**`server.mongoDBDatabaseName`**  
MongoDB Database name.

**`server.storagePath`**  
Path where files will be stored.

**`server.uploadSizeLimitPerFile`**  
Maximum size of a single file in an upload request.

**`server.mediaStreamChunckSize`**  
Chunk-size for audio / video streams. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests and
https://en.wikipedia.org/wiki/Chunked_transfer_encoding for more informations.

**`server.totalStorageLimitPerUser`**  
Storage limit for each user. `-1` (actual any value below zero) means unlimited storage quota.

**`server.defaultUIDLength`**  
Every node has its own unique id. If not specially defined this defines the default length. 
It's better to choose a long UID's to reduce the chance of a collision.

**`server.staticLinkUIDLength`**  
UID Length for static links which serve as public download links.

**`server.defaultFolderColor`**  
Default folder color (for new folders).

**`auth.maxLoginAttempts`**  
How many attempts should the user have to login.

**`auth.blockedLoginDuration`**  
How long the user need to wait (in milliseconds) until he can try again to login.

**`auth.disableRegistration`**  
If registration should be disabled. Useful if further registrations should be obviated.
