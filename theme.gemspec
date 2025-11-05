# frozen_string_literal: true

# Based on beautiful-jekyll-theme
# Original sites:
# https://github.com/daattali/beautiful-jekyll 
# https://beautifuljekyll.com
# All code from the original theme is under the MIT license. 
# My code is copyrighted, not for redistribution/copying unless you're only using it to submit a PR to improve the site.
Gem::Specification.new do |spec|
  spec.name          = "theme"
  spec.version       = "6.0.1"
  spec.authors       = ["Rose (modifications)", "Dean Attali (original)"]

  spec.summary       = "Theme"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r{^(assets|_layouts|_includes|LICENSE|README|feed|404|_data|tags)}i) }

  spec.add_runtime_dependency "jekyll", ">= 3.9.3"
  spec.add_runtime_dependency "jekyll-paginate", "~> 1.1"
  spec.add_runtime_dependency "jekyll-sitemap", ">= 1.4"
  spec.add_runtime_dependency "kramdown-parser-gfm", "~> 1.1"
  spec.add_runtime_dependency "kramdown", "~> 2.3"
  spec.add_runtime_dependency "webrick", "~> 1.8"

  spec.add_development_dependency "bundler", ">= 1.16"
  spec.add_development_dependency "rake", ">= 12.0"
  spec.add_development_dependency "appraisal", "~> 2.5"
end
