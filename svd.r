longley.dat <- cbind(longley[1:5], longley[7])

svd <- svd(scale(longley.dat, center=T, scale=F))
pca <- prcomp(longley.dat)

sum.of.sq <- sum(svd$d ** 2)

unlist(lapply(svd$d, function(val) { (val ** 2) / sum.of.sq * 100 }))
summary(pca)
