
Pod::Spec.new do |s|
  s.name             = "ReactNativeCouchbaseLite"
  s.version          = "0.0.1-master"
  s.summary          = "couchbase lite binding for react-native"
  s.license          = "MIT"
  s.platform     = :ios, "7.0"
  s.requires_arc = true
  s.authors      = "Fraser Xu <xvfeng123@gmail.com>"
  s.homepage     = "https://github.com/fraserxu/react-native-couchbase-lite.git"
  s.source       = { :git => "https://github.com/fraserxu/react-native-couchbase-lite.git", :tag => "v#{s.version}" }
  s.source_files = "ios/**/*.{h,m}"
  s.dependency "couchbase-lite-ios"
  s.dependency "couchbase-lite-ios/Listener"
end
