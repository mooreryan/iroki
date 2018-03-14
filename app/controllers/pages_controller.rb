class PagesController < ApplicationController
  def home
  end

  def about
  end

  def contact
  end

  def error
  end

  def citation
  end

  def docs
  end

  def biom
    @color_brewer_colors = [
        "OrRd",
        "PuBu",
        "BuPu",
        "Oranges",
        "BuGn",
        "YlOrBr",
        "YlGn",
        "Reds",
        "RdPu",
        "Greens",
        "YlGnBu",
        "Purples",
        "GnBu",
        "Greys",
        "YlOrRd",
        "PuRd",
        "Blues",
        "PuBuGn",
        "Viridis",
        "Spectral",
        "RdYlGn",
        "RdBu",
        "PiYG",
        "PRGn",
        "RdYlBu",
        "BrBG",
        "RdGy",
        "PuOr",
        "Set2",
        "Accent",
        "Set1",
        "Set3",
        "Dark2",
        "Paired",
        "Pastel2",
        "Pastel1",
    ]

    @color_brewer_colors_printable_names = [
        "Orange-Red",
        "Purple-Blue",
        "Blue-Purple",
        "Oranges",
        "Blue-Green",
        "Yellow-Orange-Brown",
        "Yellow-Green",
        "Reds",
        "Red-Purple",
        "Greens",
        "Yellow-Green-Blue",
        "Purples",
        "Green-Blue",
        "Greys",
        "Yellow-Orange-Red",
        "Purple-Red",
        "Blues",
        "Purple-Blue-Green",
        "Viridis",
        "Spectral",
        "Red-Yellow-Green",
        "Red-Blue",
        "Pi-YG",
        "PR-Green",
        "Red-Yellow-Blue",
        "Brown-BG",
        "Red-Gy",
        "Purple-Orange",
        "Set2",
        "Accent",
        "Set1",
        "Set3",
        "Dark2",
        "Paired",
        "Pastel2",
        "Pastel1",
    ]



  end
end
