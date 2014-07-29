module Xooie
  module Rails
    if defined?(::Rails)
      class Engine < ::Rails::Engine
      end
    end
  end
end
