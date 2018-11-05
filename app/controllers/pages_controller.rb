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

  def docs_newick; end
  def docs_mapping_files; end
  def docs_styling_opts; end
  def docs_branch_styling; end
  def docs_mapping_file_priority; end
  def docs_palettes; end

  def canvas_viewer
  end

  def tree_cluster
  end

  def biom
    @color_brewer_colors = %w(Viridis Spectral CubeHelixDefault CubeHelixSaturated OrRd PuBu BuPu Oranges BuGn YlOrBr YlGn Reds RdPu Greens YlGnBu Purples GnBu Greys YlOrRd PuRd Blues PuBuGn RdYlGn RdBu PiYG PRGn RdYlBu BrBG RdGy PuOr Set2 Accent Set1 Set3 Dark2 Paired Pastel2 Pastel1)

    @color_brewer_colors_printable_names = %w(Viridis Spectral CubeHelix-Default CubeHelix-Saturated Orange-Red Purple-Blue Blue-Purple Oranges Blue-Green Yellow-Orange-Brown Yellow-Green Reds Red-Purple Greens Yellow-Green-Blue Purples Green-Blue Greys Yellow-Orange-Red Purple-Red Blues Purple-Blue-Green Red-Yellow-Green Red-Blue Pi-YG PR-Green Red-Yellow-Blue Brown-BG Red-Gy Purple-Orange Set2 Accent Set1 Set3 Dark2 Paired Pastel2 Pastel1)

    @palette_options = Hash[@color_brewer_colors.zip(@color_brewer_colors_printable_names)]

    @palette_interpolation_vals = {
        "palette-interpolation-mode-lab"        => { name: "Lab", val: "lab" },
        "palette-interpolation-mode-lab-bezier" => { name: "Bezier Lab", val: "lab-bezier" },
        "palette-interpolation-mode-rgb"        => { name: "Red-green-blue", val: "rgb" },
        "palette-interpolation-mode-lrgb"       => { name: "Linear red-green-blue", val: "lrgb" },
        "palette-interpolation-mode-hsl"        => { name: "Hue-saturation-lightness", val: "hsl" },
        "palette-interpolation-mode-lch"        => { name: "Hue-chroma-lightness", val: "lch" },
    }
  end
end
