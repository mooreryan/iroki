require 'zeus/rails'

class CustomPlan < Zeus::Rails

  # def my_custom_command
  #  # see https://github.com/burke/zeus/blob/master/docs/ruby/modifying.md
  # end

  # See https://github.com/guard/guard-rspec/wiki/Warning:-no-environment
  #
  # Need the .to_s to convert the Pathname to string explicitly.
  def test(*args)
    # To get simple cov to work with zeus (see https://github.com/burke/zeus/wiki/SimpleCov)
    require 'simplecov'
    require 'simplecov-cobertura'

    SimpleCov.start 'rails' do
      SimpleCov.formatter = SimpleCov::Formatter::CoberturaFormatter
      SimpleCov.coverage_dir "simple_cov_output"
    end

    # require all ruby files
    Dir["#{Rails.root}/app/**/*.rb"].each { |f| load f }

    ENV['GUARD_RSPEC_RESULTS_FILE'] = Rails.root.join('tmp', 'guard_rspec_results.txt').to_s # can be anything matching Guard::RSpec :results_file option in the Guardfile
    super
  end

end

Zeus.plan = CustomPlan.new
