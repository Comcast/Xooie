require "bundler/gem_tasks"

namespace :build do
  desc "Remove app & vendor directories (run prior to gem build)"
  task :clean do
    dir_root = File.dirname(__FILE__)
    assets_dir = dir_root + '/assets'
    vendor_dir = dir_root + '/vendor'

    FileUtils.rm_rf(Dir.glob(assets_dir+'/*'))
    FileUtils.rm_rf(Dir.glob(vendor_dir+'/*'))

    puts("Contents of app & vendor directories were removed")
  end
end