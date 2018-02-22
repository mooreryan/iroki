# Iroki Todo List, Bugs, and Feature Requests



## To Dos & Bugs

### Need test cases

- Also, if you have multiple exact same leaf names and you use partial mapping, then the leaves don’t get colored even if they have a partial map. You get an error like this: ERROR -- there were non-specific matches in the mapping fle.  Ryan matched with: Ryan, Ryan.  Amelia matched with: Amelia, Amelia, Amelia.  
- If there are colons in the name of a leaf in a tree file, everything after the first colon gets chopped off.  (Needs a test case.)

This tree
((Ryan:3,Ryan:moore:40):2.3,(Amelia:1,(Amelia:2,Amelia:1.5):1.2):3);

With this mapping file
name	branch_color
Ryan	green
Amelia	blue


### Misc


- Should the g element get made only if things are going in it?
- Ensure that all ids and vals match up in the form.
- Catch errors when external javascripts don’t load

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

- [ ] Regex name matching


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

- If you have a clade all with the same leaf dot property, transfer that property to the inner node labels as well?
- Output as PhyloXML
- Export custom name/color labeling from viewer.  I.e., export an iroki mapping file for import to the next iroki session.


Dashed line for inner node bootstrap support (i.e. 3 levels).  stroke-dasharray="2,2" looks nice for the range of sizes available for the inner nodes.


