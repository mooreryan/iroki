require 'zeus/rails'

class CustomPlan < Zeus::Rails

  # def my_custom_command
  #  # see https://github.com/burke/zeus/blob/master/docs/ruby/modifying.md
  # end

  # See https://github.com/guard/guard-rspec/wiki/Warning:-no-environment
  #
  # Need the .to_s to convert the Pathname to string explicitly.
  def test(*args)
    ENV['GUARD_RSPEC_RESULTS_FILE'] = Rails.root.join('tmp', 'guard_rspec_results.txt').to_s # can be anything matching Guard::RSpec :results_file option in the Guardfile
    super
  end

end

Zeus.plan = CustomPlan.new
