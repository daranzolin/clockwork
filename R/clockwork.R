#' Create a clockwork widget
#'
#' @param data a tabular object
#' @param x a numeric variable
#' @param y a numeric variable
#' @param cycle a variable to cycle/overlay subsequent lines
#' @param x_ticks number of ticks for x-axis
#' @param y_ticks number of ticks for y-axis
#' @param show_cycle_stats whether to display the min, max, and mean for each cycle
#' @param cycle_label cycle label
#' @param size widget width and height
#' @param loop_interval cycle length in milliseconds
#' @param repeat_cycles whether to repeat visualization after all cycles
#' @param palette A D3 color palette
#'
#' @import htmlwidgets
#'
#' @export
clockwork <- function(data,
                      x,
                      y,
                      cycle,
                      x_ticks = 4,
                      y_ticks = 3,
                      show_cycle_stats = FALSE,
                      cycle_label = "Cycle: ",
                      size = 400,
                      loop_interval = 4000,
                      repeat_cycles = TRUE,
                      palette = "interpolateViridis"
                      ) {

  x <- rlang::enquo(x)
  y <- rlang::enquo(y)
  cycle <- rlang::enquo(cycle)

  data_df <- as.data.frame(data)
  out_df <- data.frame(x = rep(NA, nrow(data_df)), stringsAsFactors = FALSE)
  out_df$xValue <- data_df[,rlang::quo_name(x)]
  if (is.numeric(out_df$xValue)) {
    xIsNumeric <- TRUE
  } else {
    xIsNumeric <- FALSE
  }
  # if (!is.numeric(out_df$xValue)) stop("x must be numeric", call. = FALSE)
  out_df$yValue <- data_df[,rlang::quo_name(y)]
  if (!is.numeric(out_df$yValue)) stop("y must be numeric", call. = FALSE)
  out_df$cycle <- data_df[,rlang::quo_name(cycle)]
  cycles <- unique(out_df$cycle)
  domain <- range(out_df$yValue)

  x = list(
    data = out_df,
    cycles = cycles,
    show_cycle_stats = show_cycle_stats,
    x_ticks = x_ticks,
    y_ticks = y_ticks,
    cycle_label = cycle_label,
    size = size,
    repeat_cycles = repeat_cycles,
    loop_interval = loop_interval,
    palette = palette,
    domain = domain
  )

  htmlwidgets::createWidget(
    name = 'clockwork',
    x,
    package = 'clockwork'
  )
}

#' Style a clockwork widget
#'
#' @param clockwork a clockwork object
#' @param active_line_color color of active line being drawn
#' @param past_line_color color of past lines drawn
#' @param past_line_opacity opacity of past lines drawn
#' @param grid_line_color color of grid lines
#' @param x_axis_font_size x-axis label font-size
#' @param y_axis_font_size y-axis label font-size
#' @param inner_stats_font_size inner stats font size
#' @param font_family font family
#'
#' @return a clockwork widget
#' @export
#'
#' @examples
cw_style <- function(clockwork,
                     active_line_color = "#da4f81",
                     past_line_color = "#ccc",
                     past_line_opacity = 0.4,
                     grid_line_color = "#000",
                     x_axis_font_size = 10,
                     y_axis_font_size = 10,
                     inner_stats_font_size = 12,
                     font_family = "Arial") {

  clockwork$x$active_line_color = active_line_color
  clockwork$x$past_line_color = past_line_color
  clockwork$x$grid_line_color = grid_line_color
  clockwork$x$past_line_opacity <- past_line_opacity
  clockwork$x$x_axis_font_size <- x_axis_font_size
  clockwork$x$y_axis_font_size <- y_axis_font_size
  clockwork$x$inner_stats_font_size <- inner_stats_font_size
  clockwork$x$font_family <- font_family
  return(clockwork)
}

#' Shiny bindings for clockwork
#'
#' Output and render functions for using clockwork within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a clockwork
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name clockwork-shiny
#'
#' @export
clockworkOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'clockwork', width, height, package = 'clockwork')
}

#' @rdname clockwork-shiny
#' @export
renderClockwork <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, clockworkOutput, env, quoted = TRUE)
}
