module ApplicationHelper
  # Returns the full title on a per-page basis.
  #
  # Eg., Iroki | About
  #
  # @param page_title [String] The title of the page
  #
  # @return [String] The nav bar title of the page
  def full_title page_title
    base_title = "Iroki"
    if page_title.empty?
      base_title
    else
      "#{base_title} | #{page_title}"
    end
  end
end