center <- function(dat) { scale(dat, center=T, scale=F) }

longley.dat <- cbind(longley[1:5], longley[7])
longley.dat.small <- longley.dat[1:4,]

longley.svd <- svd(scale(longley.dat, center=T, scale=F))
longley.pca <- prcomp(longley.dat)

sum.of.sq <- sum(longley.svd$d ** 2)

unlist(lapply(longley.svd$d, function(val) { (val ** 2) / sum.of.sq * 100 }))
summary(longley.pca)


longley.svd.scores <- longley.svd$u %*% diag(longley.svd$d)
longley.pca.scores <- longley.pca$x

scores.starting.at.zero <- apply(longley.pca$x, 2, function(col) { col + abs(min(col)) })

par(mfrow=c(1,2))
## plot(longley.pca.scores, asp=1)
plot(longley.svd.scores, asp=1)
plot(longley.svd$v %*% diag(longley.svd$d), asp=1)

par(mfrow=c(1,1))
dat <- read.table("spec/test_files/biom_six_sample_two_leaves.txt", header=T, sep="\t")
d <- scale(dat[2:7], center=T, scale=F)
d.svd <- svd(d)
d.svd.scores <- d.svd$u %*% diag(d.svd$d)
d.svd.scores
plot(d.svd.scores)

d.pca <- prcomp(d)
d.pca.scores <- d.pca$x




longley.dat.small.svd <- svd(scale(longley.dat.small, center=T, scale=F))
longley.dat.small.svd.scores <- longley.dat.small.svd$u %*% diag(longley.dat.small.svd$d)
longley.dat.small.svd.scores
