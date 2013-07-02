require 'json'

FileUtils.mkdir_p 'vendor/assets/javascripts'

FileUtils.cp 'xooie.js', 'vendor/assets/javascripts'
FileUtils.cp_r 'xooie', 'vendor/assets/javascripts'

json = File.read('package.json')
config = JSON.parse(json)

Gem::Specification.new do |s|
  s.name        = config['name']
  s.version     = config['version']
  s.summary     = config['description']
  s.date        = Time.now
  s.description = config['description']
  s.license     = config['license']['type']
  s.authors     = config['author']['name']
  s.email       = config['author']['email']
  s.homepage    = config['homepage']
  s.files       = Dir[
    'vendor/assets/javascripts/xooie.js',
    'vendor/assets/javascripts/xooie/**/*',
    'lib/xooie.rb',
    'lib/Xooie/**/*',
    'README.md',
    'License.txt'
  ]

  s.add_dependency "railties", "~> 3.1"

  s.require_paths = ["lib"]
end