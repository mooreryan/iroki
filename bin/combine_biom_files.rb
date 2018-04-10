#!/usr/bin/env ruby

Signal.trap("PIPE", "EXIT")

require "abort_if"

include AbortIf

require "trollop"

opts = Trollop.options do
  banner <<-EOS

  Combine multiple biom files, e.g., the output from running
  multiple_rarefactions.py.

  Weird things may happen like not every biom file has every OTU or
  not every biom file has every sample (due to the rarefaction), but
  this will just count up everything.

  Options:
  EOS

  opt(:biom, "Biom files", type: :strings)
  opt(:method, "Method to combine values", default: "mean")
end

VALID_METHODS = %w[mean]

abort_if !opts[:biom] || opts[:biom].empty?,
         "--biom is a required option"

opts[:biom].each do |fname|
  abort_unless_file_exists fname
end

abort_unless VALID_METHODS.include?(opts[:method]),
             "--method must be one of #{VALID_METHODS.join(', ')}.  Got: #{opts[:method]}"

num_biom_files = opts[:biom].count
all_samples = []
otus = {}

opts[:biom].each do |fname|

  cidx2sample = {}

  idx = 0
  File.open(fname, "rt").each_line do |line|
    line.chomp!
    unless line == "# Constructed from biom file"
      ary = line.split "\t"

      this_otu = nil

      if idx.zero?
        ary.each_with_index do |sample, cidx|
          # the first one should be name
          unless cidx == 0
            all_samples << sample
            cidx2sample[cidx] = sample
          end
        end
      else
        ary.each_with_index do |item, cidx|
          # these are the data rows
          if cidx == 0
            this_otu = item

            unless otus.has_key? this_otu
              otus[this_otu] = Hash.new 0
            end
          else
            count = item
            sample = cidx2sample[cidx]
            otus[this_otu][sample] += count.to_f
          end
        end
      end

      idx += 1
    end
  end
end

all_samples.uniq!

puts ["name", all_samples].join "\t"

otus.each do |otu, counts|
  count_str = all_samples.map do |sample|
    if opts[:method] == "mean"
      counts[sample] / num_biom_files.to_f
    else
      counts[sample]
    end
  end.join "\t"

  puts [otu, count_str].join "\t"
end
