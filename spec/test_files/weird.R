d <- hclust(dist(read.table("data.txt", header=T, sep = "\t", row.names = 1)))

plot(d)
