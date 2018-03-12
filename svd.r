longley.dat <- cbind(longley[1:5], longley[7])

svd <- svd(scale(longley.dat, center=T, scale=F))
pca <- prcomp(longley.dat)

sum.of.sq <- sum(svd$d ** 2)

unlist(lapply(svd$d, function(val) { (val ** 2) / sum.of.sq * 100 }))
summary(pca)


svd.scores <- svd$u %*% diag(svd$d)
pca.scores <- pca$x

scores.starting.at.zero <- apply(pca$x, 2, function(col) { col + abs(min(col)) })

par(mfrow=c(1,2))
## plot(pca.scores, asp=1)
plot(svd.scores, asp=1)
plot(svd$v %*% diag(svd$d), asp=1)
