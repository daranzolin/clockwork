# clockwork

<!-- badges: start -->
![](https://camo.githubusercontent.com/ea6e0ff99602c3563e3dd684abf60b30edceaeef/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6966656379636c652d6578706572696d656e74616c2d6f72616e67652e737667)
![CRAN log](http://www.r-pkg.org/badges/version/clockwork)
<!-- badges: end -->

clockwork creates a cyclical, radial line charts. Cycle through years, months, days, hours, minutes, or campaigns.

### Installation

You can install the released version of clockwork from GitHub with:

``` r
remotes::install_github("daranzolin/clockwork")
```

### Example 1: Daily Births by Year

```r
library(tidyverse)
library(lubridate)
births <- read_csv("https://raw.githubusercontent.com/rfordatascience/tidytuesday/master/data/2018/2018-10-02/us_births_2000-2014.csv")
births <- births %>% 
  unite("date", date_of_month, month, year, sep = "-") %>% 
  mutate(date = lubridate::dmy(date),
         day_of_year = yday(date),
         year = year(date)) 

births %>% 
  filter(year %in% 2008:2014) %>% 
  clockwork(x = day_of_year,
            y = births,
            cycle = year,
            cycle_label = "Year: ",
            show_cycle_stats = TRUE,
            x_ticks = 12) 
```

![](inst/clockwork1.gif)

Control loop duration, stroke line colors/opacity, and font size/family with the `cw_style` function.


