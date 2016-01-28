#
# Be sure to run `pod lib lint ReactNativeCouchbaseLite' to ensure this is a
# valid spec and remove all comments before submitting the spec.
#
# Any lines starting with a # are optional, but encouraged
#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = "ReactNativeCouchbaseLite"
  s.version          = "0.2.2"
  s.summary          = "couchbase lite binding for react-native"
  s.license          = 'MIT'
  s.platform     = :ios, '7.0'
  s.requires_arc = true
  s.authors      = "Fraser Xu <xvfeng123@gmail.com>"
  s.homepage     = "https://github.com/fraserxu/react-native-couchbase-lite.git"
  s.source       = { :git => 'https://github.com/fraserxu/react-native-couchbase-lite.git' }
  s.source_files = 'ios/**/*.{h,m}'
  s.dependency 'couchbase-lite-ios'
  s.dependency 'couchbase-lite-ios/Listener'
end
