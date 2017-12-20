# Iroki Todo List, Bugs, and Feature Requests

## To Dos & Bugs

### Misc

#### Important

- Update old Iroki docs

Don't forget to cite these in the manuscript.

- For the radial layout: http://algo.uni-konstanz.de/publications/bbs-dpt-05.pdf

#### Less important

- Should the g element get made only if things are going in it?

### Scale bar

#### Important 

#### Less important

- Scale bar label should get pushed down more if the branch length is larger
- The scale bar placement offset behaves a bit differently depending on tree rotation and circle/rectangle-ness
- Circular trees you can adjust the scale bar right out of the svg

### User input

#### Important

#### Less important

### Tree styling

#### Important

#### Less important

- On circular trees, if the branch width is large enough, you will see little gaps in the center branches.
- When leaf dots are too big, they run into the labels
- The length of the leaves in the cladogram should match the length of the longest branch in the normalogram in rectangle mode.
- When switching branch style from cladogram to true length the labels switch back to unaligned (even if they were previously aligned.
- Padding on circular trees is much larger in comparison to padding on the rectangle trees.
- Small fonts with big dots (e.g., from the mapping file) the dot will run into the font.
- Padding should be in number of pixels not as a %. (Also requires checking to make sure padding does not exceed width or height sliders.
- Move labels back along the spine rather than in the node

### Usability 

#### Important

- On rectangle trees, the tree rotation slider people think it doesn’t do anything.

#### Less important

- Regex name matching

### Questions and things to check on 

- Make sure everything that can be resized has a .merge() call.

## Feature requests

### Essential features

- Biom file single sample
- Biom file 2 sample

### Important features

- Change root length ie relative branch length 
- Manual styling of dots
- Manual styling of labels
- Manual styling of branches
- Rotate inner labels separate from leaf labels
- Rotate specific clades 

### Features that would be nice

- On circular layout, the size of the svg should expand and contract as you rotate rather than be based on the diagonal all the time….you will often get a lot of whitespace on the circular trees.
- Automatically round the scale bar of cladograms to whole numbers?
- Separate inner and leaf rotation
- Export a template metadata file based on the submitted tree
- Zoom with scroll bar?
- Draggable positioning of elements?
- Option for background color
- Tree reflection
- Inner node dots should change color with bootstrap support values.

### Possible features

- Output as PhyloXML
- Export custom name/color labeling from viewer.  I.e., export an iroki mapping file for import to the next iroki session.



