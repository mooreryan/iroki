library(colorspace)

lala <- function() {
    polar2cart <- function(r, theta)   # polar to cartesian coords
    {
        rad <- theta * pi /180
        cbind(x = r*cos(rad),
              y = r*sin(rad))
    }

    ## par(mfrow=c(1,1))

    hue.vals <- seq(0, 360, len=200)
    chroma.vals <- seq(0, 100, len=200)

    points <- expand.grid(radius=chroma.vals, theta=hue.vals)

    print(head(points))

    xy <- polar2cart(points$radius, points$theta)

    print(head(xy))

    col <- hcl(points$theta, points$radius, 70)

    plot(xy / 100, pch=16, col=col, asp=1, cex=1.5)
}
## lala()




plot.unit.circle <- function(title="Shape") {
    domain <- seq(0, 2*pi, length.out=300)

    plot(NULL,
         xlim=c(-1, 1),
         ylim=c(-1, 1),
         xlab="",
         ylab="",
         main=title,
         asp=1,
         las=1,
         xaxt="n",
         yaxt="n"
         )

    abline(h=0, col="#aaaaaa", lty="dotted")
    abline(v=0, col="#aaaaaa", lty="dotted")

    colors <- hcl(rad.to.deg(domain), 90, 75)

    points(cos(domain), sin(domain), cex=2, col=colors, pch=16)

    domain
}

deg.to.rad <- function(deg) {
    deg / 180 * pi
}

rad.to.deg <- function(rad) {
    rad * 180 / pi
}

"%notin%" <- Negate("%in%")

vector.to <- function(deg, length=0.1, lwd=2, ...) {
                                        # Remove the duplicated 360.
    rad <- deg.to.rad(deg[1:length(deg)-1])
    len <- length(rad)

    arrows(x0=rep(0, times=len),
           y0=rep(0, times=len),
           x1=cos(rad),
           y1=sin(rad),
           lwd=lwd-1,
           length=length,
           ...)
}

polygon <- function(num.sides, length=0.1, lwd=2, ...) {
    plot.unit.circle()
    deg <- circle.points(360 / num.sides)

    vector.to(deg, length, lwd, ...)

    rad <- deg.to.rad(deg)
    rad <- c(rad, rad[1])

    lines(cos(rad), sin(rad),
          lwd=lwd,
          ...)
}
circle.points <- function(spacing) {
    seq(0, 360, by=spacing)
}


par(mfrow=c(1,1))
irregular.polygon <- function(num.sides, weights, title="Shape", lwd=2, length=0.1, col="black", ...) {
    draw.vec <- function(rad, weights, lwd=2, length=0.1, col="black", ...) {
                                        # Remove the duplicated 360.
        rad <- rad[1:length(rad)-1]
        len <- length(rad)

        theta <- rad.to.deg(rad)
        hcl.col <- hcl(theta, 90, 75)

        arrows(x0=rep(0, times=len),
               y0=rep(0, times=len),
               x1=cos(rad) * weights,
               y1=sin(rad) * weights,
               lwd=lwd-1,
               length=length,
               col=hcl.col,
               ...)
    }

    draw.polygon <- function(rad, weights, names, lwd=2, col="black", ...) {
        ## Add the first element to the end so they connect.
        weights <- c(weights, weights[1])

        lines(cos(rad) * weights,
              sin(rad) * weights,
              lwd=lwd,
              col=col,
              ...)
    }


    plot.unit.circle(title)

    deg <- circle.points(360 / num.sides)

    ## These are the radians of the spokes (includes both 0 and 2pi)
    rad <- deg.to.rad(deg)

    draw.vec(rad, weights, length=0, col=col, ...)
    draw.polygon(rad, weights, lwd=2.5, ...)
}

## irregular.polygon(3, c(1, 0.5, 0.25), col="#F38400")



draw.sample.polygons2 <- function(dat, col, ...) {
    num.samples <- ncol(dat) - 1
    names <- dat[,1]
    print(names)

    counts <- dat[,2:(num.samples+1)]
    prop <- t(apply(counts, 1, function(row) { row / max(row) }))

    ## par(mfrow=c(num.samples, num.samples))

    new.dat <- data.frame(name=names, prop)

    apply(new.dat, 1, function(row) {
        name.val <- row[1]
        prop.vals <- row[2:(length(row))]
        irregular.polygon(num.sides=num.samples,
                          weights=as.numeric(prop.vals),
                          ## title=name.val,
                          col=col,
                          ...)})
}

par(mfrow=c(1,1))
png(filename="manuscript/images/biom_six_sample_for_paper2.png", width=5, height=5, units="in", res=150)
dat <- read.table("manuscript/biom_six_sample_for_paper.txt" , header=T, sep="\t")
draw.sample.polygons2(dat, title="")

axis(1, cex.axis=0.8, line=NA, las=1, lwd=0, lwd.ticks=1, padj=-1, tck=-0.025)
axis(2, cex.axis=0.8, line=NA, las=1, lwd=0, lwd.ticks=1, hadj=0.65, tck=-0.025)

mtext("Y", side=2, line=2.25, las=1)
mtext("X", side=1, line=2.25, las=1)

text(1.15, 0.05, "S1", cex=0.9)
text(0.22, 0.25, "S2", cex=0.9)
text(-0.455, 0.755, "S3", cex=0.9)
text(-0.35, -0.08, "S4", cex=0.9)
text(-0.4, -0.7, "S5", cex=0.9)
text(0.35, -0.6, "S6", cex=0.9)
dev.off()
