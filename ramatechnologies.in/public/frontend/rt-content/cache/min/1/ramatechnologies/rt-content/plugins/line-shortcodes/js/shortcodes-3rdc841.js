!function () {
    var t =
            [].indexOf ||
            function (t) {
                for (var e = 0, i = this.length; i > e; e++)
                    if (e in this && this[e] === t) return e;
                return -1;
            },
        e = [].slice;
    !(function (t, e) {
        return "function" == typeof define && define.amd
            ? define("waypoints", ["jquery"], function (i) {
                  return e(i, t);
              })
            : e(t.jQuery, t);
    })(window, function (i, n) {
        var o, s, r, a, l, u, c, p, d, h, f, m, v, g, y, w;
        return (
            (o = i(n)),
            (p = t.call(n, "ontouchstart") >= 0),
            (a = { horizontal: {}, vertical: {} }),
            (l = 1),
            (c = {}),
            (u = "waypoints-context-id"),
            (f = "resize.waypoints"),
            (m = "scroll.waypoints"),
            (v = 1),
            (g = "waypoints-waypoint-ids"),
            (y = "waypoint"),
            (w = "waypoints"),
            (s = (function () {
                function t(t) {
                    var e = this;
                    (this.$element = t),
                        (this.element = t[0]),
                        (this.didResize = !1),
                        (this.didScroll = !1),
                        (this.id = "context" + l++),
                        (this.oldScroll = {
                            x: t.scrollLeft(),
                            y: t.scrollTop(),
                        }),
                        (this.waypoints = { horizontal: {}, vertical: {} }),
                        (this.element[u] = this.id),
                        (c[this.id] = this),
                        t.bind(m, function () {
                            var t;
                            return e.didScroll || p
                                ? void 0
                                : ((e.didScroll = !0),
                                  (t = function () {
                                      return e.doScroll(), (e.didScroll = !1);
                                  }),
                                  n.setTimeout(
                                      t,
                                      i[w].settings.scrollThrottle
                                  ));
                        }),
                        t.bind(f, function () {
                            var t;
                            return e.didResize
                                ? void 0
                                : ((e.didResize = !0),
                                  (t = function () {
                                      return (
                                          i[w]("refresh"), (e.didResize = !1)
                                      );
                                  }),
                                  n.setTimeout(
                                      t,
                                      i[w].settings.resizeThrottle
                                  ));
                        });
                }
                return (
                    (t.prototype.doScroll = function () {
                        var t,
                            e = this;
                        return (
                            (t = {
                                horizontal: {
                                    newScroll: this.$element.scrollLeft(),
                                    oldScroll: this.oldScroll.x,
                                    forward: "right",
                                    backward: "left",
                                },
                                vertical: {
                                    newScroll: this.$element.scrollTop(),
                                    oldScroll: this.oldScroll.y,
                                    forward: "down",
                                    backward: "up",
                                },
                            }),
                            !p ||
                                (t.vertical.oldScroll &&
                                    t.vertical.newScroll) ||
                                i[w]("refresh"),
                            i.each(t, function (t, n) {
                                var o, s, r;
                                return (
                                    (r = []),
                                    (s = n.newScroll > n.oldScroll),
                                    (o = s ? n.forward : n.backward),
                                    i.each(e.waypoints[t], function (t, e) {
                                        var i, o;
                                        return n.oldScroll < (i = e.offset) &&
                                            i <= n.newScroll
                                            ? r.push(e)
                                            : n.newScroll < (o = e.offset) &&
                                              o <= n.oldScroll
                                            ? r.push(e)
                                            : void 0;
                                    }),
                                    r.sort(function (t, e) {
                                        return t.offset - e.offset;
                                    }),
                                    s || r.reverse(),
                                    i.each(r, function (t, e) {
                                        return e.options.continuous ||
                                            t === r.length - 1
                                            ? e.trigger([o])
                                            : void 0;
                                    })
                                );
                            }),
                            (this.oldScroll = {
                                x: t.horizontal.newScroll,
                                y: t.vertical.newScroll,
                            })
                        );
                    }),
                    (t.prototype.refresh = function () {
                        var t,
                            e,
                            n,
                            o = this;
                        return (
                            (n = i.isWindow(this.element)),
                            (e = this.$element.offset()),
                            this.doScroll(),
                            (t = {
                                horizontal: {
                                    contextOffset: n ? 0 : e.left,
                                    contextScroll: n ? 0 : this.oldScroll.x,
                                    contextDimension: this.$element.width(),
                                    oldScroll: this.oldScroll.x,
                                    forward: "right",
                                    backward: "left",
                                    offsetProp: "left",
                                },
                                vertical: {
                                    contextOffset: n ? 0 : e.top,
                                    contextScroll: n ? 0 : this.oldScroll.y,
                                    contextDimension: n
                                        ? i[w]("viewportHeight")
                                        : this.$element.height(),
                                    oldScroll: this.oldScroll.y,
                                    forward: "down",
                                    backward: "up",
                                    offsetProp: "top",
                                },
                            }),
                            i.each(t, function (t, e) {
                                return i.each(o.waypoints[t], function (t, n) {
                                    var o, s, r, a, l;
                                    return (
                                        (o = n.options.offset),
                                        (r = n.offset),
                                        (s = i.isWindow(n.element)
                                            ? 0
                                            : n.$element.offset()[
                                                  e.offsetProp
                                              ]),
                                        i.isFunction(o)
                                            ? (o = o.apply(n.element))
                                            : "string" == typeof o &&
                                              ((o = parseFloat(o)),
                                              n.options.offset.indexOf("%") >
                                                  -1 &&
                                                  (o = Math.ceil(
                                                      (e.contextDimension * o) /
                                                          100
                                                  ))),
                                        (n.offset =
                                            s -
                                            e.contextOffset +
                                            e.contextScroll -
                                            o),
                                        (n.options.onlyOnScroll && null != r) ||
                                        !n.enabled
                                            ? void 0
                                            : null !== r &&
                                              r < (a = e.oldScroll) &&
                                              a <= n.offset
                                            ? n.trigger([e.backward])
                                            : null !== r &&
                                              r > (l = e.oldScroll) &&
                                              l >= n.offset
                                            ? n.trigger([e.forward])
                                            : null === r &&
                                              e.oldScroll >= n.offset
                                            ? n.trigger([e.forward])
                                            : void 0
                                    );
                                });
                            })
                        );
                    }),
                    (t.prototype.checkEmpty = function () {
                        return i.isEmptyObject(this.waypoints.horizontal) &&
                            i.isEmptyObject(this.waypoints.vertical)
                            ? (this.$element.unbind([f, m].join(" ")),
                              delete c[this.id])
                            : void 0;
                    }),
                    t
                );
            })()),
            (r = (function () {
                function t(t, e, n) {
                    var o, s;
                    "bottom-in-view" === n.offset &&
                        (n.offset = function () {
                            var t;
                            return (
                                (t = i[w]("viewportHeight")),
                                i.isWindow(e.element) ||
                                    (t = e.$element.height()),
                                t - i(this).outerHeight()
                            );
                        }),
                        (this.$element = t),
                        (this.element = t[0]),
                        (this.axis = n.horizontal ? "horizontal" : "vertical"),
                        (this.callback = n.handler),
                        (this.context = e),
                        (this.enabled = n.enabled),
                        (this.id = "waypoints" + v++),
                        (this.offset = null),
                        (this.options = n),
                        (e.waypoints[this.axis][this.id] = this),
                        (a[this.axis][this.id] = this),
                        (o = null != (s = this.element[g]) ? s : []),
                        o.push(this.id),
                        (this.element[g] = o);
                }
                return (
                    (t.prototype.trigger = function (t) {
                        return this.enabled
                            ? (null != this.callback &&
                                  this.callback.apply(this.element, t),
                              this.options.triggerOnce
                                  ? this.destroy()
                                  : void 0)
                            : void 0;
                    }),
                    (t.prototype.disable = function () {
                        return (this.enabled = !1);
                    }),
                    (t.prototype.enable = function () {
                        return this.context.refresh(), (this.enabled = !0);
                    }),
                    (t.prototype.destroy = function () {
                        return (
                            delete a[this.axis][this.id],
                            delete this.context.waypoints[this.axis][this.id],
                            this.context.checkEmpty()
                        );
                    }),
                    (t.getWaypointsByElement = function (t) {
                        var e, n;
                        return (n = t[g])
                            ? ((e = i.extend({}, a.horizontal, a.vertical)),
                              i.map(n, function (t) {
                                  return e[t];
                              }))
                            : [];
                    }),
                    t
                );
            })()),
            (h = {
                init: function (t, e) {
                    var n;
                    return (
                        (e = i.extend({}, i.fn[y].defaults, e)),
                        null == (n = e.handler) && (e.handler = t),
                        this.each(function () {
                            var t, n, o, a;
                            return (
                                (t = i(this)),
                                (o =
                                    null != (a = e.context)
                                        ? a
                                        : i.fn[y].defaults.context),
                                i.isWindow(o) || (o = t.closest(o)),
                                (o = i(o)),
                                (n = c[o[0][u]]),
                                n || (n = new s(o)),
                                new r(t, n, e)
                            );
                        }),
                        i[w]("refresh"),
                        this
                    );
                },
                disable: function () {
                    return h._invoke.call(this, "disable");
                },
                enable: function () {
                    return h._invoke.call(this, "enable");
                },
                destroy: function () {
                    return h._invoke.call(this, "destroy");
                },
                prev: function (t, e) {
                    return h._traverse.call(this, t, e, function (t, e, i) {
                        return e > 0 ? t.push(i[e - 1]) : void 0;
                    });
                },
                next: function (t, e) {
                    return h._traverse.call(this, t, e, function (t, e, i) {
                        return e < i.length - 1 ? t.push(i[e + 1]) : void 0;
                    });
                },
                _traverse: function (t, e, o) {
                    var s, r;
                    return (
                        null == t && (t = "vertical"),
                        null == e && (e = n),
                        (r = d.aggregate(e)),
                        (s = []),
                        this.each(function () {
                            var e;
                            return (e = i.inArray(this, r[t])), o(s, e, r[t]);
                        }),
                        this.pushStack(s)
                    );
                },
                _invoke: function (t) {
                    return (
                        this.each(function () {
                            var e;
                            return (
                                (e = r.getWaypointsByElement(this)),
                                i.each(e, function (e, i) {
                                    return i[t](), !0;
                                })
                            );
                        }),
                        this
                    );
                },
            }),
            (i.fn[y] = function () {
                var t, n;
                return (
                    (n = arguments[0]),
                    (t = 2 <= arguments.length ? e.call(arguments, 1) : []),
                    h[n]
                        ? h[n].apply(this, t)
                        : i.isFunction(n)
                        ? h.init.apply(this, arguments)
                        : i.isPlainObject(n)
                        ? h.init.apply(this, [null, n])
                        : n
                        ? i.error(
                              "The " +
                                  n +
                                  " method does not exist in jQuery Waypoints."
                          )
                        : i.error(
                              "jQuery Waypoints needs a callback function or handler option."
                          )
                );
            }),
            (i.fn[y].defaults = {
                context: n,
                continuous: !0,
                enabled: !0,
                horizontal: !1,
                offset: 0,
                triggerOnce: !1,
            }),
            (d = {
                refresh: function () {
                    return i.each(c, function (t, e) {
                        return e.refresh();
                    });
                },
                viewportHeight: function () {
                    var t;
                    return null != (t = n.innerHeight) ? t : o.height();
                },
                aggregate: function (t) {
                    var e, n, o;
                    return (
                        (e = a),
                        t &&
                            (e =
                                null != (o = c[i(t)[0][u]])
                                    ? o.waypoints
                                    : void 0),
                        e
                            ? ((n = { horizontal: [], vertical: [] }),
                              i.each(n, function (t, o) {
                                  return (
                                      i.each(e[t], function (t, e) {
                                          return o.push(e);
                                      }),
                                      o.sort(function (t, e) {
                                          return t.offset - e.offset;
                                      }),
                                      (n[t] = i.map(o, function (t) {
                                          return t.element;
                                      })),
                                      (n[t] = i.unique(n[t]))
                                  );
                              }),
                              n)
                            : []
                    );
                },
                above: function (t) {
                    return (
                        null == t && (t = n),
                        d._filter(t, "vertical", function (t, e) {
                            return e.offset <= t.oldScroll.y;
                        })
                    );
                },
                below: function (t) {
                    return (
                        null == t && (t = n),
                        d._filter(t, "vertical", function (t, e) {
                            return e.offset > t.oldScroll.y;
                        })
                    );
                },
                left: function (t) {
                    return (
                        null == t && (t = n),
                        d._filter(t, "horizontal", function (t, e) {
                            return e.offset <= t.oldScroll.x;
                        })
                    );
                },
                right: function (t) {
                    return (
                        null == t && (t = n),
                        d._filter(t, "horizontal", function (t, e) {
                            return e.offset > t.oldScroll.x;
                        })
                    );
                },
                enable: function () {
                    return d._invoke("enable");
                },
                disable: function () {
                    return d._invoke("disable");
                },
                destroy: function () {
                    return d._invoke("destroy");
                },
                extendFn: function (t, e) {
                    return (h[t] = e);
                },
                _invoke: function (t) {
                    var e;
                    return (
                        (e = i.extend({}, a.vertical, a.horizontal)),
                        i.each(e, function (e, i) {
                            return i[t](), !0;
                        })
                    );
                },
                _filter: function (t, e, n) {
                    var o, s;
                    return (o = c[i(t)[0][u]])
                        ? ((s = []),
                          i.each(o.waypoints[e], function (t, e) {
                              return n(o, e) ? s.push(e) : void 0;
                          }),
                          s.sort(function (t, e) {
                              return t.offset - e.offset;
                          }),
                          i.map(s, function (t) {
                              return t.element;
                          }))
                        : [];
                },
            }),
            (i[w] = function () {
                var t, i;
                return (
                    (i = arguments[0]),
                    (t = 2 <= arguments.length ? e.call(arguments, 1) : []),
                    d[i] ? d[i].apply(null, t) : d.aggregate.call(null, i)
                );
            }),
            (i[w].settings = { resizeThrottle: 100, scrollThrottle: 30 }),
            o.on("load.waypoints", function () {
                return i[w]("refresh");
            })
        );
    });
}.call(this),
    !(function (t) {
        "use strict";
        "function" == typeof define && define.amd
            ? define(["jquery"], t)
            : t(jQuery);
    })(function (t) {
        "use strict";
        function e(t) {
            if (t instanceof Date) return t;
            if (String(t).match(r))
                return (
                    String(t).match(/^[0-9]*$/) && (t = Number(t)),
                    String(t).match(/\-/) &&
                        (t = String(t).replace(/\-/g, "/")),
                    new Date(t)
                );
            throw new Error("Couldn't cast `" + t + "` to a date object.");
        }
        function i(t) {
            return function (e) {
                var i = e.match(/%(-|!)?[A-Z]{1}(:[^;]+;)?/gi);
                if (i)
                    for (var o = 0, s = i.length; s > o; ++o) {
                        var r = i[o].match(/%(-|!)?([a-zA-Z]{1})(:[^;]+;)?/),
                            l = new RegExp(r[0]),
                            u = r[1] || "",
                            c = r[3] || "",
                            p = null;
                        (r = r[2]),
                            a.hasOwnProperty(r) &&
                                ((p = a[r]), (p = Number(t[p]))),
                            null !== p &&
                                ("!" === u && (p = n(c, p)),
                                "" === u && 10 > p && (p = "0" + p.toString()),
                                (e = e.replace(l, p.toString())));
                    }
                return (e = e.replace(/%%/, "%"));
            };
        }
        function n(t, e) {
            var i = "s",
                n = "";
            return (
                t &&
                    ((t = t.replace(/(:|;|\s)/gi, "").split(/\,/)),
                    1 === t.length ? (i = t[0]) : ((n = t[0]), (i = t[1]))),
                1 === Math.abs(e) ? n : i
            );
        }
        var o = 100,
            s = [],
            r = [];
        r.push(/^[0-9]*$/.source),
            r.push(
                /([0-9]{1,2}\/){2}[0-9]{4}( [0-9]{1,2}(:[0-9]{2}){2})?/.source
            ),
            r.push(
                /[0-9]{4}([\/\-][0-9]{1,2}){2}( [0-9]{1,2}(:[0-9]{2}){2})?/
                    .source
            ),
            (r = new RegExp(r.join("|")));
        var a = {
                Y: "years",
                m: "months",
                w: "weeks",
                d: "days",
                D: "totalDays",
                H: "hours",
                M: "minutes",
                S: "seconds",
            },
            l = function (e, i, n) {
                (this.el = e),
                    (this.$el = t(e)),
                    (this.interval = null),
                    (this.offset = {}),
                    (this.instanceNumber = s.length),
                    s.push(this),
                    this.$el.data("countdown-instance", this.instanceNumber),
                    n &&
                        (this.$el.on("update.countdown", n),
                        this.$el.on("stoped.countdown", n),
                        this.$el.on("finish.countdown", n)),
                    this.setFinalDate(i),
                    this.start();
            };
        t.extend(l.prototype, {
            start: function () {
                null !== this.interval && clearInterval(this.interval);
                var t = this;
                this.update(),
                    (this.interval = setInterval(function () {
                        t.update.call(t);
                    }, o));
            },
            stop: function () {
                clearInterval(this.interval),
                    (this.interval = null),
                    this.dispatchEvent("stoped");
            },
            pause: function () {
                this.stop.call(this);
            },
            resume: function () {
                this.start.call(this);
            },
            remove: function () {
                this.stop(),
                    (s[this.instanceNumber] = null),
                    delete this.$el.data().countdownInstance;
            },
            setFinalDate: function (t) {
                this.finalDate = e(t);
            },
            update: function () {
                return 0 === this.$el.closest("html").length
                    ? void this.remove()
                    : ((this.totalSecsLeft =
                          this.finalDate.getTime() - new Date().getTime()),
                      (this.totalSecsLeft = Math.ceil(
                          this.totalSecsLeft / 1e3
                      )),
                      (this.totalSecsLeft =
                          this.totalSecsLeft < 0 ? 0 : this.totalSecsLeft),
                      (this.offset = {
                          seconds: this.totalSecsLeft % 60,
                          minutes: Math.floor(this.totalSecsLeft / 60) % 60,
                          hours: Math.floor(this.totalSecsLeft / 60 / 60) % 24,
                          days:
                              Math.floor(this.totalSecsLeft / 60 / 60 / 24) % 7,
                          totalDays: Math.floor(
                              this.totalSecsLeft / 60 / 60 / 24
                          ),
                          weeks: Math.floor(
                              this.totalSecsLeft / 60 / 60 / 24 / 7
                          ),
                          months: Math.floor(
                              this.totalSecsLeft / 60 / 60 / 24 / 30
                          ),
                          years: Math.floor(
                              this.totalSecsLeft / 60 / 60 / 24 / 365
                          ),
                      }),
                      void (0 === this.totalSecsLeft
                          ? (this.stop(), this.dispatchEvent("finish"))
                          : this.dispatchEvent("update")));
            },
            dispatchEvent: function (e) {
                var n = t.Event(e + ".countdown");
                (n.finalDate = this.finalDate),
                    (n.offset = t.extend({}, this.offset)),
                    (n.strftime = i(this.offset)),
                    this.$el.trigger(n);
            },
        }),
            (t.fn.countdown = function () {
                var e = Array.prototype.slice.call(arguments, 0);
                return this.each(function () {
                    var i = t(this).data("countdown-instance");
                    if (void 0 !== i) {
                        var n = s[i],
                            o = e[0];
                        l.prototype.hasOwnProperty(o)
                            ? n[o].apply(n, e.slice(1))
                            : null === String(o).match(/^[$A-Z_][0-9A-Z_$]*$/i)
                            ? (n.setFinalDate.call(n, o), n.start())
                            : t.error(
                                  "Method %s does not exist on jQuery.countdown".replace(
                                      /\%s/gi,
                                      o
                                  )
                              );
                    } else new l(this, e[0], e[1]);
                });
            });
    }),
    (function (t) {
        "use strict";
        t.fn.counterUp = function (e) {
            var i = t.extend({ time: 400, delay: 10 }, e);
            return this.each(function () {
                var e = t(this),
                    n = i,
                    o = function () {
                        var t = [],
                            i = n.time / n.delay,
                            o = e.text(),
                            s = /[0-9]+,[0-9]+/.test(o);
                        o = o.replace(/,/g, "");
                        for (
                            var r =
                                    (/^[0-9]+$/.test(o),
                                    /^[0-9]+\.[0-9]+$/.test(o)),
                                a = r ? (o.split(".")[1] || []).length : 0,
                                l = i;
                            l >= 1;
                            l--
                        ) {
                            var u = parseInt((o / i) * l);
                            if (
                                (r && (u = parseFloat((o / i) * l).toFixed(a)),
                                s)
                            )
                                for (; /(\d+)(\d{3})/.test(u.toString()); )
                                    u = u
                                        .toString()
                                        .replace(/(\d+)(\d{3})/, "$1,$2");
                            t.unshift(u);
                        }
                        e.data("counterup-nums", t), e.text("0");
                        var c = function () {
                            e.text(e.data("counterup-nums").shift()),
                                e.data("counterup-nums").length
                                    ? setTimeout(
                                          e.data("counterup-func"),
                                          n.delay
                                      )
                                    : (delete e.data("counterup-nums"),
                                      e.data("counterup-nums", null),
                                      e.data("counterup-func", null));
                        };
                        e.data("counterup-func", c),
                            setTimeout(e.data("counterup-func"), n.delay);
                    };
                e.waypoint(o, { offset: "100%", triggerOnce: !0 });
            });
        };
    })(jQuery),
    !(function (t) {
        (t.flexslider = function (e, i) {
            var n = t(e);
            n.vars = t.extend({}, t.flexslider.defaults, i);
            var o,
                s = n.vars.namespace,
                r =
                    window.navigator &&
                    window.navigator.msPointerEnabled &&
                    window.MSGesture,
                a =
                    ("ontouchstart" in window ||
                        r ||
                        (window.DocumentTouch &&
                            document instanceof DocumentTouch)) &&
                    n.vars.touch,
                l = "click touchend MSPointerUp",
                u = "",
                c = "vertical" === n.vars.direction,
                p = n.vars.reverse,
                d = n.vars.itemWidth > 0,
                h = "fade" === n.vars.animation,
                f = "" !== n.vars.asNavFor,
                m = {},
                v = !0;
            t.data(e, "flexslider", n),
                (m = {
                    init: function () {
                        (n.animating = !1),
                            (n.currentSlide = parseInt(
                                n.vars.startAt ? n.vars.startAt : 0,
                                10
                            )),
                            isNaN(n.currentSlide) && (n.currentSlide = 0),
                            (n.animatingTo = n.currentSlide),
                            (n.atEnd =
                                0 === n.currentSlide ||
                                n.currentSlide === n.last),
                            (n.containerSelector = n.vars.selector.substr(
                                0,
                                n.vars.selector.search(" ")
                            )),
                            (n.slides = t(n.vars.selector, n)),
                            (n.container = t(n.containerSelector, n)),
                            (n.count = n.slides.length),
                            (n.syncExists = t(n.vars.sync).length > 0),
                            "slide" === n.vars.animation &&
                                (n.vars.animation = "swing"),
                            (n.prop = c ? "top" : "marginLeft"),
                            (n.args = {}),
                            (n.manualPause = !1),
                            (n.stopped = !1),
                            (n.started = !1),
                            (n.startTimeout = null),
                            (n.transitions =
                                !n.vars.video &&
                                !h &&
                                n.vars.useCSS &&
                                (function () {
                                    var t = document.createElement("div"),
                                        e = [
                                            "perspectiveProperty",
                                            "WebkitPerspective",
                                            "MozPerspective",
                                            "OPerspective",
                                            "msPerspective",
                                        ];
                                    for (var i in e)
                                        if (void 0 !== t.style[e[i]])
                                            return (
                                                (n.pfx = e[i]
                                                    .replace("Perspective", "")
                                                    .toLowerCase()),
                                                (n.prop =
                                                    "-" + n.pfx + "-transform"),
                                                !0
                                            );
                                    return !1;
                                })()),
                            (n.ensureAnimationEnd = ""),
                            "" !== n.vars.controlsContainer &&
                                (n.controlsContainer =
                                    t(n.vars.controlsContainer).length > 0 &&
                                    t(n.vars.controlsContainer)),
                            "" !== n.vars.manualControls &&
                                (n.manualControls =
                                    t(n.vars.manualControls).length > 0 &&
                                    t(n.vars.manualControls)),
                            n.vars.randomize &&
                                (n.slides.sort(function () {
                                    return Math.round(Math.random()) - 0.5;
                                }),
                                n.container.empty().append(n.slides)),
                            n.doMath(),
                            n.setup("init"),
                            n.vars.controlNav && m.controlNav.setup(),
                            n.vars.directionNav && m.directionNav.setup(),
                            n.vars.keyboard &&
                                (1 === t(n.containerSelector).length ||
                                    n.vars.multipleKeyboard) &&
                                t(document).bind("keyup", function (t) {
                                    var e = t.keyCode;
                                    if (
                                        !n.animating &&
                                        (39 === e || 37 === e)
                                    ) {
                                        var i =
                                            39 === e
                                                ? n.getTarget("next")
                                                : 37 === e
                                                ? n.getTarget("prev")
                                                : !1;
                                        n.flexAnimate(i, n.vars.pauseOnAction);
                                    }
                                }),
                            n.vars.mousewheel &&
                                n.bind("mousewheel", function (t, e) {
                                    t.preventDefault();
                                    var i =
                                        0 > e
                                            ? n.getTarget("next")
                                            : n.getTarget("prev");
                                    n.flexAnimate(i, n.vars.pauseOnAction);
                                }),
                            n.vars.pausePlay && m.pausePlay.setup(),
                            n.vars.slideshow &&
                                n.vars.pauseInvisible &&
                                m.pauseInvisible.init(),
                            n.vars.slideshow &&
                                (n.vars.pauseOnHover &&
                                    n.hover(
                                        function () {
                                            n.manualPlay ||
                                                n.manualPause ||
                                                n.pause();
                                        },
                                        function () {
                                            n.manualPause ||
                                                n.manualPlay ||
                                                n.stopped ||
                                                n.play();
                                        }
                                    ),
                                (n.vars.pauseInvisible &&
                                    m.pauseInvisible.isHidden()) ||
                                    (n.vars.initDelay > 0
                                        ? (n.startTimeout = setTimeout(
                                              n.play,
                                              n.vars.initDelay
                                          ))
                                        : n.play())),
                            f && m.asNav.setup(),
                            a && n.vars.touch && m.touch(),
                            (!h || (h && n.vars.smoothHeight)) &&
                                t(window).bind(
                                    "resize orientationchange focus",
                                    m.resize
                                ),
                            n.find("img").attr("draggable", "false"),
                            setTimeout(function () {
                                n.vars.start(n);
                            }, 200);
                    },
                    asNav: {
                        setup: function () {
                            (n.asNav = !0),
                                (n.animatingTo = Math.floor(
                                    n.currentSlide / n.move
                                )),
                                (n.currentItem = n.currentSlide),
                                n.slides
                                    .removeClass(s + "active-slide")
                                    .eq(n.currentItem)
                                    .addClass(s + "active-slide"),
                                r
                                    ? ((e._slider = n),
                                      n.slides.each(function () {
                                          var e = this;
                                          (e._gesture = new MSGesture()),
                                              (e._gesture.target = e),
                                              e.addEventListener(
                                                  "MSPointerDown",
                                                  function (t) {
                                                      t.preventDefault(),
                                                          t.currentTarget
                                                              ._gesture &&
                                                              t.currentTarget._gesture.addPointer(
                                                                  t.pointerId
                                                              );
                                                  },
                                                  !1
                                              ),
                                              e.addEventListener(
                                                  "MSGestureTap",
                                                  function (e) {
                                                      e.preventDefault();
                                                      var i = t(this),
                                                          o = i.index();
                                                      t(n.vars.asNavFor).data(
                                                          "flexslider"
                                                      ).animating ||
                                                          i.hasClass(
                                                              "active"
                                                          ) ||
                                                          ((n.direction =
                                                              n.currentItem < o
                                                                  ? "next"
                                                                  : "prev"),
                                                          n.flexAnimate(
                                                              o,
                                                              n.vars
                                                                  .pauseOnAction,
                                                              !1,
                                                              !0,
                                                              !0
                                                          ));
                                                  }
                                              );
                                      }))
                                    : n.slides.on(l, function (e) {
                                          e.preventDefault();
                                          var i = t(this),
                                              o = i.index(),
                                              r =
                                                  i.offset().left -
                                                  t(n).scrollLeft();
                                          0 >= r &&
                                          i.hasClass(s + "active-slide")
                                              ? n.flexAnimate(
                                                    n.getTarget("prev"),
                                                    !0
                                                )
                                              : t(n.vars.asNavFor).data(
                                                    "flexslider"
                                                ).animating ||
                                                i.hasClass(
                                                    s + "active-slide"
                                                ) ||
                                                ((n.direction =
                                                    n.currentItem < o
                                                        ? "next"
                                                        : "prev"),
                                                n.flexAnimate(
                                                    o,
                                                    n.vars.pauseOnAction,
                                                    !1,
                                                    !0,
                                                    !0
                                                ));
                                      });
                        },
                    },
                    controlNav: {
                        setup: function () {
                            n.manualControls
                                ? m.controlNav.setupManual()
                                : m.controlNav.setupPaging();
                        },
                        setupPaging: function () {
                            var e,
                                i,
                                o =
                                    "thumbnails" === n.vars.controlNav
                                        ? "control-thumbs"
                                        : "control-paging",
                                r = 1;
                            if (
                                ((n.controlNavScaffold = t(
                                    '<ol class="' +
                                        s +
                                        "control-nav " +
                                        s +
                                        o +
                                        '"></ol>'
                                )),
                                n.pagingCount > 1)
                            )
                                for (var a = 0; a < n.pagingCount; a++) {
                                    if (
                                        ((i = n.slides.eq(a)),
                                        (e =
                                            "thumbnails" === n.vars.controlNav
                                                ? '<img src="' +
                                                  i.attr("data-thumb") +
                                                  '"/>'
                                                : "<a>" + r + "</a>"),
                                        "thumbnails" === n.vars.controlNav &&
                                            !0 === n.vars.thumbCaptions)
                                    ) {
                                        var c = i.attr("data-thumbcaption");
                                        "" != c &&
                                            void 0 != c &&
                                            (e +=
                                                '<span class="' +
                                                s +
                                                'caption">' +
                                                c +
                                                "</span>");
                                    }
                                    n.controlNavScaffold.append(
                                        "<li>" + e + "</li>"
                                    ),
                                        r++;
                                }
                            n.controlsContainer
                                ? t(n.controlsContainer).append(
                                      n.controlNavScaffold
                                  )
                                : n.append(n.controlNavScaffold),
                                m.controlNav.set(),
                                m.controlNav.active(),
                                n.controlNavScaffold.delegate(
                                    "a, img",
                                    l,
                                    function (e) {
                                        if (
                                            (e.preventDefault(),
                                            "" === u || u === e.type)
                                        ) {
                                            var i = t(this),
                                                o = n.controlNav.index(i);
                                            i.hasClass(s + "active") ||
                                                ((n.direction =
                                                    o > n.currentSlide
                                                        ? "next"
                                                        : "prev"),
                                                n.flexAnimate(
                                                    o,
                                                    n.vars.pauseOnAction
                                                ));
                                        }
                                        "" === u && (u = e.type),
                                            m.setToClearWatchedEvent();
                                    }
                                );
                        },
                        setupManual: function () {
                            (n.controlNav = n.manualControls),
                                m.controlNav.active(),
                                n.controlNav.bind(l, function (e) {
                                    if (
                                        (e.preventDefault(),
                                        "" === u || u === e.type)
                                    ) {
                                        var i = t(this),
                                            o = n.controlNav.index(i);
                                        i.hasClass(s + "active") ||
                                            ((n.direction =
                                                o > n.currentSlide
                                                    ? "next"
                                                    : "prev"),
                                            n.flexAnimate(
                                                o,
                                                n.vars.pauseOnAction
                                            ));
                                    }
                                    "" === u && (u = e.type),
                                        m.setToClearWatchedEvent();
                                });
                        },
                        set: function () {
                            var e =
                                "thumbnails" === n.vars.controlNav
                                    ? "img"
                                    : "a";
                            n.controlNav = t(
                                "." + s + "control-nav li " + e,
                                n.controlsContainer ? n.controlsContainer : n
                            );
                        },
                        active: function () {
                            n.controlNav
                                .removeClass(s + "active")
                                .eq(n.animatingTo)
                                .addClass(s + "active");
                        },
                        update: function (e, i) {
                            n.pagingCount > 1 && "add" === e
                                ? n.controlNavScaffold.append(
                                      t("<li><a>" + n.count + "</a></li>")
                                  )
                                : 1 === n.pagingCount
                                ? n.controlNavScaffold.find("li").remove()
                                : n.controlNav.eq(i).closest("li").remove(),
                                m.controlNav.set(),
                                n.pagingCount > 1 &&
                                n.pagingCount !== n.controlNav.length
                                    ? n.update(i, e)
                                    : m.controlNav.active();
                        },
                    },
                    directionNav: {
                        setup: function () {
                            var e = t(
                                '<ul class="' +
                                    s +
                                    'direction-nav"><li><a class="' +
                                    s +
                                    'prev" href="#">' +
                                    n.vars.prevText +
                                    '</a></li><li><a class="' +
                                    s +
                                    'next" href="#">' +
                                    n.vars.nextText +
                                    "</a></li></ul>"
                            );
                            n.controlsContainer
                                ? (t(n.controlsContainer).append(e),
                                  (n.directionNav = t(
                                      "." + s + "direction-nav li a",
                                      n.controlsContainer
                                  )))
                                : (n.append(e),
                                  (n.directionNav = t(
                                      "." + s + "direction-nav li a",
                                      n
                                  ))),
                                m.directionNav.update(),
                                n.directionNav.bind(l, function (e) {
                                    e.preventDefault();
                                    var i;
                                    ("" === u || u === e.type) &&
                                        ((i = t(this).hasClass(s + "next")
                                            ? n.getTarget("next")
                                            : n.getTarget("prev")),
                                        n.flexAnimate(i, n.vars.pauseOnAction)),
                                        "" === u && (u = e.type),
                                        m.setToClearWatchedEvent();
                                });
                        },
                        update: function () {
                            var t = s + "disabled";
                            1 === n.pagingCount
                                ? n.directionNav
                                      .addClass(t)
                                      .attr("tabindex", "-1")
                                : n.vars.animationLoop
                                ? n.directionNav
                                      .removeClass(t)
                                      .removeAttr("tabindex")
                                : 0 === n.animatingTo
                                ? n.directionNav
                                      .removeClass(t)
                                      .filter("." + s + "prev")
                                      .addClass(t)
                                      .attr("tabindex", "-1")
                                : n.animatingTo === n.last
                                ? n.directionNav
                                      .removeClass(t)
                                      .filter("." + s + "next")
                                      .addClass(t)
                                      .attr("tabindex", "-1")
                                : n.directionNav
                                      .removeClass(t)
                                      .removeAttr("tabindex");
                        },
                    },
                    pausePlay: {
                        setup: function () {
                            var e = t(
                                '<div class="' + s + 'pauseplay"><a></a></div>'
                            );
                            n.controlsContainer
                                ? (n.controlsContainer.append(e),
                                  (n.pausePlay = t(
                                      "." + s + "pauseplay a",
                                      n.controlsContainer
                                  )))
                                : (n.append(e),
                                  (n.pausePlay = t(
                                      "." + s + "pauseplay a",
                                      n
                                  ))),
                                m.pausePlay.update(
                                    n.vars.slideshow ? s + "pause" : s + "play"
                                ),
                                n.pausePlay.bind(l, function (e) {
                                    e.preventDefault(),
                                        ("" === u || u === e.type) &&
                                            (t(this).hasClass(s + "pause")
                                                ? ((n.manualPause = !0),
                                                  (n.manualPlay = !1),
                                                  n.pause())
                                                : ((n.manualPause = !1),
                                                  (n.manualPlay = !0),
                                                  n.play())),
                                        "" === u && (u = e.type),
                                        m.setToClearWatchedEvent();
                                });
                        },
                        update: function (t) {
                            "play" === t
                                ? n.pausePlay
                                      .removeClass(s + "pause")
                                      .addClass(s + "play")
                                      .html(n.vars.playText)
                                : n.pausePlay
                                      .removeClass(s + "play")
                                      .addClass(s + "pause")
                                      .html(n.vars.pauseText);
                        },
                    },
                    touch: function () {
                        function t(t) {
                            n.animating
                                ? t.preventDefault()
                                : (window.navigator.msPointerEnabled ||
                                      1 === t.touches.length) &&
                                  (n.pause(),
                                  (v = c ? n.h : n.w),
                                  (y = Number(new Date())),
                                  (_ = t.touches[0].pageX),
                                  (b = t.touches[0].pageY),
                                  (m =
                                      d && p && n.animatingTo === n.last
                                          ? 0
                                          : d && p
                                          ? n.limit -
                                            (n.itemW + n.vars.itemMargin) *
                                                n.move *
                                                n.animatingTo
                                          : d && n.currentSlide === n.last
                                          ? n.limit
                                          : d
                                          ? (n.itemW + n.vars.itemMargin) *
                                            n.move *
                                            n.currentSlide
                                          : p
                                          ? (n.last -
                                                n.currentSlide +
                                                n.cloneOffset) *
                                            v
                                          : (n.currentSlide + n.cloneOffset) *
                                            v),
                                  (u = c ? b : _),
                                  (f = c ? _ : b),
                                  e.addEventListener("touchmove", i, !1),
                                  e.addEventListener("touchend", o, !1));
                        }
                        function i(t) {
                            (_ = t.touches[0].pageX),
                                (b = t.touches[0].pageY),
                                (g = c ? u - b : u - _),
                                (w = c
                                    ? Math.abs(g) < Math.abs(_ - f)
                                    : Math.abs(g) < Math.abs(b - f));
                            var e = 500;
                            (!w || Number(new Date()) - y > e) &&
                                (t.preventDefault(),
                                !h &&
                                    n.transitions &&
                                    (n.vars.animationLoop ||
                                        (g /=
                                            (0 === n.currentSlide && 0 > g) ||
                                            (n.currentSlide === n.last && g > 0)
                                                ? Math.abs(g) / v + 2
                                                : 1),
                                    n.setProps(m + g, "setTouch")));
                        }
                        function o() {
                            if (
                                (e.removeEventListener("touchmove", i, !1),
                                n.animatingTo === n.currentSlide &&
                                    !w &&
                                    null !== g)
                            ) {
                                var t = p ? -g : g,
                                    s =
                                        t > 0
                                            ? n.getTarget("next")
                                            : n.getTarget("prev");
                                n.canAdvance(s) &&
                                ((Number(new Date()) - y < 550 &&
                                    Math.abs(t) > 50) ||
                                    Math.abs(t) > v / 2)
                                    ? n.flexAnimate(s, n.vars.pauseOnAction)
                                    : h ||
                                      n.flexAnimate(
                                          n.currentSlide,
                                          n.vars.pauseOnAction,
                                          !0
                                      );
                            }
                            e.removeEventListener("touchend", o, !1),
                                (u = null),
                                (f = null),
                                (g = null),
                                (m = null);
                        }
                        function s(t) {
                            t.stopPropagation(),
                                n.animating
                                    ? t.preventDefault()
                                    : (n.pause(),
                                      e._gesture.addPointer(t.pointerId),
                                      (x = 0),
                                      (v = c ? n.h : n.w),
                                      (y = Number(new Date())),
                                      (m =
                                          d && p && n.animatingTo === n.last
                                              ? 0
                                              : d && p
                                              ? n.limit -
                                                (n.itemW + n.vars.itemMargin) *
                                                    n.move *
                                                    n.animatingTo
                                              : d && n.currentSlide === n.last
                                              ? n.limit
                                              : d
                                              ? (n.itemW + n.vars.itemMargin) *
                                                n.move *
                                                n.currentSlide
                                              : p
                                              ? (n.last -
                                                    n.currentSlide +
                                                    n.cloneOffset) *
                                                v
                                              : (n.currentSlide +
                                                    n.cloneOffset) *
                                                v));
                        }
                        function a(t) {
                            t.stopPropagation();
                            var i = t.target._slider;
                            if (i) {
                                var n = -t.translationX,
                                    o = -t.translationY;
                                return (
                                    (x += c ? o : n),
                                    (g = x),
                                    (w = c
                                        ? Math.abs(x) < Math.abs(-n)
                                        : Math.abs(x) < Math.abs(-o)),
                                    t.detail === t.MSGESTURE_FLAG_INERTIA
                                        ? (setImmediate(function () {
                                              e._gesture.stop();
                                          }),
                                          void 0)
                                        : ((!w ||
                                              Number(new Date()) - y > 500) &&
                                              (t.preventDefault(),
                                              !h &&
                                                  i.transitions &&
                                                  (i.vars.animationLoop ||
                                                      (g =
                                                          x /
                                                          ((0 ===
                                                              i.currentSlide &&
                                                              0 > x) ||
                                                          (i.currentSlide ===
                                                              i.last &&
                                                              x > 0)
                                                              ? Math.abs(x) /
                                                                    v +
                                                                2
                                                              : 1)),
                                                  i.setProps(
                                                      m + g,
                                                      "setTouch"
                                                  ))),
                                          void 0)
                                );
                            }
                        }
                        function l(t) {
                            t.stopPropagation();
                            var e = t.target._slider;
                            if (e) {
                                if (
                                    e.animatingTo === e.currentSlide &&
                                    !w &&
                                    null !== g
                                ) {
                                    var i = p ? -g : g,
                                        n =
                                            i > 0
                                                ? e.getTarget("next")
                                                : e.getTarget("prev");
                                    e.canAdvance(n) &&
                                    ((Number(new Date()) - y < 550 &&
                                        Math.abs(i) > 50) ||
                                        Math.abs(i) > v / 2)
                                        ? e.flexAnimate(n, e.vars.pauseOnAction)
                                        : h ||
                                          e.flexAnimate(
                                              e.currentSlide,
                                              e.vars.pauseOnAction,
                                              !0
                                          );
                                }
                                (u = null),
                                    (f = null),
                                    (g = null),
                                    (m = null),
                                    (x = 0);
                            }
                        }
                        var u,
                            f,
                            m,
                            v,
                            g,
                            y,
                            w = !1,
                            _ = 0,
                            b = 0,
                            x = 0;
                        r
                            ? ((e.style.msTouchAction = "none"),
                              (e._gesture = new MSGesture()),
                              (e._gesture.target = e),
                              e.addEventListener("MSPointerDown", s, !1),
                              (e._slider = n),
                              e.addEventListener("MSGestureChange", a, !1),
                              e.addEventListener("MSGestureEnd", l, !1))
                            : e.addEventListener("touchstart", t, !1);
                    },
                    resize: function () {
                        !n.animating &&
                            n.is(":visible") &&
                            (d || n.doMath(),
                            h
                                ? m.smoothHeight()
                                : d
                                ? (n.slides.width(n.computedW),
                                  n.update(n.pagingCount),
                                  n.setProps())
                                : c
                                ? (n.viewport.height(n.h),
                                  n.setProps(n.h, "setTotal"))
                                : (n.vars.smoothHeight && m.smoothHeight(),
                                  n.newSlides.width(n.computedW),
                                  n.setProps(n.computedW, "setTotal")));
                    },
                    smoothHeight: function (t) {
                        if (!c || h) {
                            var e = h ? n : n.viewport;
                            t
                                ? e.animate(
                                      {
                                          height: n.slides
                                              .eq(n.animatingTo)
                                              .height(),
                                      },
                                      t
                                  )
                                : e.height(n.slides.eq(n.animatingTo).height());
                        }
                    },
                    sync: function (e) {
                        var i = t(n.vars.sync).data("flexslider"),
                            o = n.animatingTo;
                        switch (e) {
                            case "animate":
                                i.flexAnimate(o, n.vars.pauseOnAction, !1, !0);
                                break;
                            case "play":
                                i.playing || i.asNav || i.play();
                                break;
                            case "pause":
                                i.pause();
                        }
                    },
                    uniqueID: function (e) {
                        return (
                            e.find("[id]").each(function () {
                                var e = t(this);
                                e.attr("id", e.attr("id") + "_clone");
                            }),
                            e
                        );
                    },
                    pauseInvisible: {
                        visProp: null,
                        init: function () {
                            var t = ["webkit", "moz", "ms", "o"];
                            if ("hidden" in document) return "hidden";
                            for (var e = 0; e < t.length; e++)
                                t[e] + "Hidden" in document &&
                                    (m.pauseInvisible.visProp =
                                        t[e] + "Hidden");
                            if (m.pauseInvisible.visProp) {
                                var i =
                                    m.pauseInvisible.visProp.replace(
                                        /[H|h]idden/,
                                        ""
                                    ) + "visibilitychange";
                                document.addEventListener(i, function () {
                                    m.pauseInvisible.isHidden()
                                        ? n.startTimeout
                                            ? clearTimeout(n.startTimeout)
                                            : n.pause()
                                        : n.started
                                        ? n.play()
                                        : n.vars.initDelay > 0
                                        ? setTimeout(n.play, n.vars.initDelay)
                                        : n.play();
                                });
                            }
                        },
                        isHidden: function () {
                            return document[m.pauseInvisible.visProp] || !1;
                        },
                    },
                    setToClearWatchedEvent: function () {
                        clearTimeout(o),
                            (o = setTimeout(function () {
                                u = "";
                            }, 3e3));
                    },
                }),
                (n.flexAnimate = function (e, i, o, r, l) {
                    if (
                        (n.vars.animationLoop ||
                            e === n.currentSlide ||
                            (n.direction =
                                e > n.currentSlide ? "next" : "prev"),
                        f &&
                            1 === n.pagingCount &&
                            (n.direction = n.currentItem < e ? "next" : "prev"),
                        !n.animating &&
                            (n.canAdvance(e, l) || o) &&
                            n.is(":visible"))
                    ) {
                        if (f && r) {
                            var u = t(n.vars.asNavFor).data("flexslider");
                            if (
                                ((n.atEnd = 0 === e || e === n.count - 1),
                                u.flexAnimate(e, !0, !1, !0, l),
                                (n.direction =
                                    n.currentItem < e ? "next" : "prev"),
                                (u.direction = n.direction),
                                Math.ceil((e + 1) / n.visible) - 1 ===
                                    n.currentSlide || 0 === e)
                            )
                                return (
                                    (n.currentItem = e),
                                    n.slides
                                        .removeClass(s + "active-slide")
                                        .eq(e)
                                        .addClass(s + "active-slide"),
                                    !1
                                );
                            (n.currentItem = e),
                                n.slides
                                    .removeClass(s + "active-slide")
                                    .eq(e)
                                    .addClass(s + "active-slide"),
                                (e = Math.floor(e / n.visible));
                        }
                        if (
                            ((n.animating = !0),
                            (n.animatingTo = e),
                            i && n.pause(),
                            n.vars.before(n),
                            n.syncExists && !l && m.sync("animate"),
                            n.vars.controlNav && m.controlNav.active(),
                            d ||
                                n.slides
                                    .removeClass(s + "active-slide")
                                    .eq(e)
                                    .addClass(s + "active-slide"),
                            (n.atEnd = 0 === e || e === n.last),
                            n.vars.directionNav && m.directionNav.update(),
                            e === n.last &&
                                (n.vars.end(n),
                                n.vars.animationLoop || n.pause()),
                            h)
                        )
                            a
                                ? (n.slides
                                      .eq(n.currentSlide)
                                      .css({ opacity: 0, zIndex: 1 }),
                                  n.slides.eq(e).css({ opacity: 1, zIndex: 2 }),
                                  n.wrapup(w))
                                : (n.slides
                                      .eq(n.currentSlide)
                                      .css({ zIndex: 1 })
                                      .animate(
                                          { opacity: 0 },
                                          n.vars.animationSpeed,
                                          n.vars.easing
                                      ),
                                  n.slides
                                      .eq(e)
                                      .css({ zIndex: 2 })
                                      .animate(
                                          { opacity: 1 },
                                          n.vars.animationSpeed,
                                          n.vars.easing,
                                          n.wrapup
                                      ));
                        else {
                            var v,
                                g,
                                y,
                                w = c
                                    ? n.slides.filter(":first").height()
                                    : n.computedW;
                            d
                                ? ((v = n.vars.itemMargin),
                                  (y = (n.itemW + v) * n.move * n.animatingTo),
                                  (g =
                                      y > n.limit && 1 !== n.visible
                                          ? n.limit
                                          : y))
                                : (g =
                                      0 === n.currentSlide &&
                                      e === n.count - 1 &&
                                      n.vars.animationLoop &&
                                      "next" !== n.direction
                                          ? p
                                              ? (n.count + n.cloneOffset) * w
                                              : 0
                                          : n.currentSlide === n.last &&
                                            0 === e &&
                                            n.vars.animationLoop &&
                                            "prev" !== n.direction
                                          ? p
                                              ? 0
                                              : (n.count + 1) * w
                                          : p
                                          ? (n.count - 1 - e + n.cloneOffset) *
                                            w
                                          : (e + n.cloneOffset) * w),
                                n.setProps(g, "", n.vars.animationSpeed),
                                n.transitions
                                    ? ((n.vars.animationLoop && n.atEnd) ||
                                          ((n.animating = !1),
                                          (n.currentSlide = n.animatingTo)),
                                      n.container.unbind(
                                          "webkitTransitionEnd transitionend"
                                      ),
                                      n.container.bind(
                                          "webkitTransitionEnd transitionend",
                                          function () {
                                              clearTimeout(
                                                  n.ensureAnimationEnd
                                              ),
                                                  n.wrapup(w);
                                          }
                                      ),
                                      clearTimeout(n.ensureAnimationEnd),
                                      (n.ensureAnimationEnd = setTimeout(
                                          function () {
                                              n.wrapup(w);
                                          },
                                          n.vars.animationSpeed + 100
                                      )))
                                    : n.container.animate(
                                          n.args,
                                          n.vars.animationSpeed,
                                          n.vars.easing,
                                          function () {
                                              n.wrapup(w);
                                          }
                                      );
                        }
                        n.vars.smoothHeight &&
                            m.smoothHeight(n.vars.animationSpeed);
                    }
                }),
                (n.wrapup = function (t) {
                    h ||
                        d ||
                        (0 === n.currentSlide &&
                        n.animatingTo === n.last &&
                        n.vars.animationLoop
                            ? n.setProps(t, "jumpEnd")
                            : n.currentSlide === n.last &&
                              0 === n.animatingTo &&
                              n.vars.animationLoop &&
                              n.setProps(t, "jumpStart")),
                        (n.animating = !1),
                        (n.currentSlide = n.animatingTo),
                        n.vars.after(n);
                }),
                (n.animateSlides = function () {
                    !n.animating && v && n.flexAnimate(n.getTarget("next"));
                }),
                (n.pause = function () {
                    clearInterval(n.animatedSlides),
                        (n.animatedSlides = null),
                        (n.playing = !1),
                        n.vars.pausePlay && m.pausePlay.update("play"),
                        n.syncExists && m.sync("pause");
                }),
                (n.play = function () {
                    n.playing && clearInterval(n.animatedSlides),
                        (n.animatedSlides =
                            n.animatedSlides ||
                            setInterval(
                                n.animateSlides,
                                n.vars.slideshowSpeed
                            )),
                        (n.started = n.playing = !0),
                        n.vars.pausePlay && m.pausePlay.update("pause"),
                        n.syncExists && m.sync("play");
                }),
                (n.stop = function () {
                    n.pause(), (n.stopped = !0);
                }),
                (n.canAdvance = function (t, e) {
                    var i = f ? n.pagingCount - 1 : n.last;
                    return e
                        ? !0
                        : f &&
                          n.currentItem === n.count - 1 &&
                          0 === t &&
                          "prev" === n.direction
                        ? !0
                        : f &&
                          0 === n.currentItem &&
                          t === n.pagingCount - 1 &&
                          "next" !== n.direction
                        ? !1
                        : t !== n.currentSlide || f
                        ? n.vars.animationLoop
                            ? !0
                            : n.atEnd &&
                              0 === n.currentSlide &&
                              t === i &&
                              "next" !== n.direction
                            ? !1
                            : n.atEnd &&
                              n.currentSlide === i &&
                              0 === t &&
                              "next" === n.direction
                            ? !1
                            : !0
                        : !1;
                }),
                (n.getTarget = function (t) {
                    return (
                        (n.direction = t),
                        "next" === t
                            ? n.currentSlide === n.last
                                ? 0
                                : n.currentSlide + 1
                            : 0 === n.currentSlide
                            ? n.last
                            : n.currentSlide - 1
                    );
                }),
                (n.setProps = function (t, e, i) {
                    var o = (function () {
                        var i = t
                                ? t
                                : (n.itemW + n.vars.itemMargin) *
                                  n.move *
                                  n.animatingTo,
                            o = (function () {
                                if (d)
                                    return "setTouch" === e
                                        ? t
                                        : p && n.animatingTo === n.last
                                        ? 0
                                        : p
                                        ? n.limit -
                                          (n.itemW + n.vars.itemMargin) *
                                              n.move *
                                              n.animatingTo
                                        : n.animatingTo === n.last
                                        ? n.limit
                                        : i;
                                switch (e) {
                                    case "setTotal":
                                        return p
                                            ? (n.count -
                                                  1 -
                                                  n.currentSlide +
                                                  n.cloneOffset) *
                                                  t
                                            : (n.currentSlide + n.cloneOffset) *
                                                  t;
                                    case "setTouch":
                                        return p ? t : t;
                                    case "jumpEnd":
                                        return p ? t : n.count * t;
                                    case "jumpStart":
                                        return p ? n.count * t : t;
                                    default:
                                        return t;
                                }
                            })();
                        return -1 * o + "px";
                    })();
                    n.transitions &&
                        ((o = c
                            ? "translate3d(0," + o + ",0)"
                            : "translate3d(" + o + ",0,0)"),
                        (i = void 0 !== i ? i / 1e3 + "s" : "0s"),
                        n.container.css(
                            "-" + n.pfx + "-transition-duration",
                            i
                        ),
                        n.container.css("transition-duration", i)),
                        (n.args[n.prop] = o),
                        (n.transitions || void 0 === i) &&
                            n.container.css(n.args),
                        n.container.css("transform", o);
                }),
                (n.setup = function (e) {
                    if (h)
                        n.slides.css({
                            width: "100%",
                            float: "left",
                            marginRight: "-100%",
                            position: "relative",
                        }),
                            "init" === e &&
                                (a
                                    ? n.slides
                                          .css({
                                              opacity: 0,
                                              display: "block",
                                              webkitTransition:
                                                  "opacity " +
                                                  n.vars.animationSpeed / 1e3 +
                                                  "s ease",
                                              zIndex: 1,
                                          })
                                          .eq(n.currentSlide)
                                          .css({ opacity: 1, zIndex: 2 })
                                    : n.slides
                                          .css({
                                              opacity: 0,
                                              display: "block",
                                              zIndex: 1,
                                          })
                                          .eq(n.currentSlide)
                                          .css({ zIndex: 2 })
                                          .animate(
                                              { opacity: 1 },
                                              n.vars.animationSpeed,
                                              n.vars.easing
                                          )),
                            n.vars.smoothHeight && m.smoothHeight();
                    else {
                        var i, o;
                        "init" === e &&
                            ((n.viewport = t(
                                '<div class="' + s + 'viewport"></div>'
                            )
                                .css({
                                    overflow: "hidden",
                                    position: "relative",
                                })
                                .appendTo(n)
                                .append(n.container)),
                            (n.cloneCount = 0),
                            (n.cloneOffset = 0),
                            p &&
                                ((o = t.makeArray(n.slides).reverse()),
                                (n.slides = t(o)),
                                n.container.empty().append(n.slides))),
                            n.vars.animationLoop &&
                                !d &&
                                ((n.cloneCount = 2),
                                (n.cloneOffset = 1),
                                "init" !== e &&
                                    n.container.find(".clone").remove(),
                                m
                                    .uniqueID(
                                        n.slides
                                            .first()
                                            .clone()
                                            .addClass("clone")
                                            .attr("aria-hidden", "true")
                                    )
                                    .appendTo(n.container),
                                m
                                    .uniqueID(
                                        n.slides
                                            .last()
                                            .clone()
                                            .addClass("clone")
                                            .attr("aria-hidden", "true")
                                    )
                                    .prependTo(n.container)),
                            (n.newSlides = t(n.vars.selector, n)),
                            (i = p
                                ? n.count - 1 - n.currentSlide + n.cloneOffset
                                : n.currentSlide + n.cloneOffset),
                            c && !d
                                ? (n.container
                                      .height(
                                          200 * (n.count + n.cloneCount) + "%"
                                      )
                                      .css("position", "absolute")
                                      .width("100%"),
                                  setTimeout(
                                      function () {
                                          n.newSlides.css({ display: "block" }),
                                              n.doMath(),
                                              n.viewport.height(n.h),
                                              n.setProps(i * n.h, "init");
                                      },
                                      "init" === e ? 100 : 0
                                  ))
                                : (n.container.width(
                                      200 * (n.count + n.cloneCount) + "%"
                                  ),
                                  n.setProps(i * n.computedW, "init"),
                                  setTimeout(
                                      function () {
                                          n.doMath(),
                                              n.newSlides.css({
                                                  width: n.computedW,
                                                  float: "left",
                                                  display: "block",
                                              }),
                                              n.vars.smoothHeight &&
                                                  m.smoothHeight();
                                      },
                                      "init" === e ? 100 : 0
                                  ));
                    }
                    d ||
                        n.slides
                            .removeClass(s + "active-slide")
                            .eq(n.currentSlide)
                            .addClass(s + "active-slide"),
                        n.vars.init(n);
                }),
                (n.doMath = function () {
                    var t = n.slides.first(),
                        e = n.vars.itemMargin,
                        i = n.vars.minItems,
                        o = n.vars.maxItems;
                    (n.w =
                        void 0 === n.viewport ? n.width() : n.viewport.width()),
                        (n.h = t.height()),
                        (n.boxPadding = t.outerWidth() - t.width()),
                        d
                            ? ((n.itemT = n.vars.itemWidth + e),
                              (n.minW = i ? i * n.itemT : n.w),
                              (n.maxW = o ? o * n.itemT - e : n.w),
                              (n.itemW =
                                  n.minW > n.w
                                      ? (n.w - e * (i - 1)) / i
                                      : n.maxW < n.w
                                      ? (n.w - e * (o - 1)) / o
                                      : n.vars.itemWidth > n.w
                                      ? n.w
                                      : n.vars.itemWidth),
                              (n.visible = Math.floor(n.w / n.itemW)),
                              (n.move =
                                  n.vars.move > 0 && n.vars.move < n.visible
                                      ? n.vars.move
                                      : n.visible),
                              (n.pagingCount = Math.ceil(
                                  (n.count - n.visible) / n.move + 1
                              )),
                              (n.last = n.pagingCount - 1),
                              (n.limit =
                                  1 === n.pagingCount
                                      ? 0
                                      : n.vars.itemWidth > n.w
                                      ? n.itemW * (n.count - 1) +
                                        e * (n.count - 1)
                                      : (n.itemW + e) * n.count - n.w - e))
                            : ((n.itemW = n.w),
                              (n.pagingCount = n.count),
                              (n.last = n.count - 1)),
                        (n.computedW = n.itemW - n.boxPadding);
                }),
                (n.update = function (t, e) {
                    n.doMath(),
                        d ||
                            (t < n.currentSlide
                                ? (n.currentSlide += 1)
                                : t <= n.currentSlide &&
                                  0 !== t &&
                                  (n.currentSlide -= 1),
                            (n.animatingTo = n.currentSlide)),
                        n.vars.controlNav &&
                            !n.manualControls &&
                            (("add" === e && !d) ||
                            n.pagingCount > n.controlNav.length
                                ? m.controlNav.update("add")
                                : (("remove" === e && !d) ||
                                      n.pagingCount < n.controlNav.length) &&
                                  (d &&
                                      n.currentSlide > n.last &&
                                      ((n.currentSlide -= 1),
                                      (n.animatingTo -= 1)),
                                  m.controlNav.update("remove", n.last))),
                        n.vars.directionNav && m.directionNav.update();
                }),
                (n.addSlide = function (e, i) {
                    var o = t(e);
                    (n.count += 1),
                        (n.last = n.count - 1),
                        c && p
                            ? void 0 !== i
                                ? n.slides.eq(n.count - i).after(o)
                                : n.container.prepend(o)
                            : void 0 !== i
                            ? n.slides.eq(i).before(o)
                            : n.container.append(o),
                        n.update(i, "add"),
                        (n.slides = t(n.vars.selector + ":not(.clone)", n)),
                        n.setup(),
                        n.vars.added(n);
                }),
                (n.removeSlide = function (e) {
                    var i = isNaN(e) ? n.slides.index(t(e)) : e;
                    (n.count -= 1),
                        (n.last = n.count - 1),
                        isNaN(e)
                            ? t(e, n.slides).remove()
                            : c && p
                            ? n.slides.eq(n.last).remove()
                            : n.slides.eq(e).remove(),
                        n.doMath(),
                        n.update(i, "remove"),
                        (n.slides = t(n.vars.selector + ":not(.clone)", n)),
                        n.setup(),
                        n.vars.removed(n);
                }),
                m.init();
        }),
            t(window)
                .blur(function () {
                    focused = !1;
                })
                .focus(function () {
                    focused = !0;
                }),
            (t.flexslider.defaults = {
                namespace: "flex-",
                selector: ".slides > li",
                animation: "fade",
                easing: "swing",
                direction: "horizontal",
                reverse: !1,
                animationLoop: !0,
                smoothHeight: !1,
                startAt: 0,
                slideshow: !0,
                slideshowSpeed: 7e3,
                animationSpeed: 600,
                initDelay: 0,
                randomize: !1,
                thumbCaptions: !1,
                pauseOnAction: !0,
                pauseOnHover: !1,
                pauseInvisible: !0,
                useCSS: !0,
                touch: !0,
                video: !1,
                controlNav: !0,
                directionNav: !0,
                prevText: "Previous",
                nextText: "Next",
                keyboard: !0,
                multipleKeyboard: !1,
                mousewheel: !1,
                pausePlay: !1,
                pauseText: "Pause",
                playText: "Play",
                controlsContainer: "",
                manualControls: "",
                sync: "",
                asNavFor: "",
                itemWidth: 0,
                itemMargin: 0,
                minItems: 1,
                maxItems: 0,
                move: 0,
                allowOneSlide: !0,
                start: function () {},
                before: function () {},
                after: function () {},
                end: function () {},
                added: function () {},
                removed: function () {},
                init: function () {},
            }),
            (t.fn.flexslider = function (e) {
                if ((void 0 === e && (e = {}), "object" == typeof e))
                    return this.each(function () {
                        var i = t(this),
                            n = e.selector ? e.selector : ".slides > li",
                            o = i.find(n);
                        (1 === o.length && e.allowOneSlide === !0) ||
                        0 === o.length
                            ? (o.fadeIn(400), e.start && e.start(i))
                            : void 0 === i.data("flexslider") &&
                              new t.flexslider(this, e);
                    });
                var i = t(this).data("flexslider");
                switch (e) {
                    case "play":
                        i.play();
                        break;
                    case "pause":
                        i.pause();
                        break;
                    case "stop":
                        i.stop();
                        break;
                    case "next":
                        i.flexAnimate(i.getTarget("next"), !0);
                        break;
                    case "prev":
                    case "previous":
                        i.flexAnimate(i.getTarget("prev"), !0);
                        break;
                    default:
                        "number" == typeof e && i.flexAnimate(e, !0);
                }
            });
    })(jQuery),
    "function" != typeof Object.create &&
        (Object.create = function (t) {
            function e() {}
            return (e.prototype = t), new e();
        }),
    (function (t, e, i) {
        var n = {
            init: function (e, i) {
                var n = this;
                (n.$elem = t(i)),
                    (n.options = t.extend(
                        {},
                        t.fn.owlCarousel.options,
                        n.$elem.data(),
                        e
                    )),
                    (n.userOptions = e),
                    n.loadContent();
            },
            loadContent: function () {
                function e(t) {
                    var e,
                        i = "";
                    if ("function" == typeof n.options.jsonSuccess)
                        n.options.jsonSuccess.apply(this, [t]);
                    else {
                        for (e in t.owl)
                            t.owl.hasOwnProperty(e) && (i += t.owl[e].item);
                        n.$elem.html(i);
                    }
                    n.logIn();
                }
                var i,
                    n = this;
                "function" == typeof n.options.beforeInit &&
                    n.options.beforeInit.apply(this, [n.$elem]),
                    "string" == typeof n.options.jsonPath
                        ? ((i = n.options.jsonPath), t.getJSON(i, e))
                        : n.logIn();
            },
            logIn: function () {
                var t = this;
                t.$elem.data("owl-originalStyles", t.$elem.attr("style")),
                    t.$elem.data("owl-originalClasses", t.$elem.attr("class")),
                    t.$elem.css({ opacity: 0 }),
                    (t.orignalItems = t.options.items),
                    t.checkBrowser(),
                    (t.wrapperWidth = 0),
                    (t.checkVisible = null),
                    t.setVars();
            },
            setVars: function () {
                var t = this;
                return 0 === t.$elem.children().length
                    ? !1
                    : (t.baseClass(),
                      t.eventTypes(),
                      (t.$userItems = t.$elem.children()),
                      (t.itemsAmount = t.$userItems.length),
                      t.wrapItems(),
                      (t.$owlItems = t.$elem.find(".owl-item")),
                      (t.$owlWrapper = t.$elem.find(".owl-wrapper")),
                      (t.playDirection = "next"),
                      (t.prevItem = 0),
                      (t.prevArr = [0]),
                      (t.currentItem = 0),
                      t.customEvents(),
                      t.onStartup(),
                      void 0);
            },
            onStartup: function () {
                var t = this;
                t.updateItems(),
                    t.calculateAll(),
                    t.buildControls(),
                    t.updateControls(),
                    t.response(),
                    t.moveEvents(),
                    t.stopOnHover(),
                    t.owlStatus(),
                    t.options.transitionStyle !== !1 &&
                        t.transitionTypes(t.options.transitionStyle),
                    t.options.autoPlay === !0 && (t.options.autoPlay = 5e3),
                    t.play(),
                    t.$elem.find(".owl-wrapper").css("display", "block"),
                    t.$elem.is(":visible")
                        ? t.$elem.css("opacity", 1)
                        : t.watchVisibility(),
                    (t.onstartup = !1),
                    t.eachMoveUpdate(),
                    "function" == typeof t.options.afterInit &&
                        t.options.afterInit.apply(this, [t.$elem]);
            },
            eachMoveUpdate: function () {
                var t = this;
                t.options.lazyLoad === !0 && t.lazyLoad(),
                    t.options.autoHeight === !0 && t.autoHeight(),
                    t.onVisibleItems(),
                    "function" == typeof t.options.afterAction &&
                        t.options.afterAction.apply(this, [t.$elem]);
            },
            updateVars: function () {
                var t = this;
                "function" == typeof t.options.beforeUpdate &&
                    t.options.beforeUpdate.apply(this, [t.$elem]),
                    t.watchVisibility(),
                    t.updateItems(),
                    t.calculateAll(),
                    t.updatePosition(),
                    t.updateControls(),
                    t.eachMoveUpdate(),
                    "function" == typeof t.options.afterUpdate &&
                        t.options.afterUpdate.apply(this, [t.$elem]);
            },
            reload: function () {
                var t = this;
                e.setTimeout(function () {
                    t.updateVars();
                }, 0);
            },
            watchVisibility: function () {
                var t = this;
                return t.$elem.is(":visible") !== !1
                    ? !1
                    : (t.$elem.css({ opacity: 0 }),
                      e.clearInterval(t.autoPlayInterval),
                      e.clearInterval(t.checkVisible),
                      (t.checkVisible = e.setInterval(function () {
                          t.$elem.is(":visible") &&
                              (t.reload(),
                              t.$elem.animate({ opacity: 1 }, 200),
                              e.clearInterval(t.checkVisible));
                      }, 500)),
                      void 0);
            },
            wrapItems: function () {
                var t = this;
                t.$userItems
                    .wrapAll('<div class="owl-wrapper">')
                    .wrap('<div class="owl-item"></div>'),
                    t.$elem
                        .find(".owl-wrapper")
                        .wrap('<div class="owl-wrapper-outer">'),
                    (t.wrapperOuter = t.$elem.find(".owl-wrapper-outer")),
                    t.$elem.css("display", "block");
            },
            baseClass: function () {
                var t = this,
                    e = t.$elem.hasClass(t.options.baseClass),
                    i = t.$elem.hasClass(t.options.theme);
                e || t.$elem.addClass(t.options.baseClass),
                    i || t.$elem.addClass(t.options.theme);
            },
            updateItems: function () {
                var e,
                    i,
                    n = this;
                if (n.options.responsive === !1) return !1;
                if (n.options.singleItem === !0)
                    return (
                        (n.options.items = n.orignalItems = 1),
                        (n.options.itemsCustom = !1),
                        (n.options.itemsDesktop = !1),
                        (n.options.itemsDesktopSmall = !1),
                        (n.options.itemsTablet = !1),
                        (n.options.itemsTabletSmall = !1),
                        (n.options.itemsMobile = !1),
                        !1
                    );
                if (
                    ((e = t(n.options.responsiveBaseWidth).width()),
                    e > (n.options.itemsDesktop[0] || n.orignalItems) &&
                        (n.options.items = n.orignalItems),
                    n.options.itemsCustom !== !1)
                )
                    for (
                        n.options.itemsCustom.sort(function (t, e) {
                            return t[0] - e[0];
                        }),
                            i = 0;
                        i < n.options.itemsCustom.length;
                        i += 1
                    )
                        n.options.itemsCustom[i][0] <= e &&
                            (n.options.items = n.options.itemsCustom[i][1]);
                else
                    e <= n.options.itemsDesktop[0] &&
                        n.options.itemsDesktop !== !1 &&
                        (n.options.items = n.options.itemsDesktop[1]),
                        e <= n.options.itemsDesktopSmall[0] &&
                            n.options.itemsDesktopSmall !== !1 &&
                            (n.options.items = n.options.itemsDesktopSmall[1]),
                        e <= n.options.itemsTablet[0] &&
                            n.options.itemsTablet !== !1 &&
                            (n.options.items = n.options.itemsTablet[1]),
                        e <= n.options.itemsTabletSmall[0] &&
                            n.options.itemsTabletSmall !== !1 &&
                            (n.options.items = n.options.itemsTabletSmall[1]),
                        e <= n.options.itemsMobile[0] &&
                            n.options.itemsMobile !== !1 &&
                            (n.options.items = n.options.itemsMobile[1]);
                n.options.items > n.itemsAmount &&
                    n.options.itemsScaleUp === !0 &&
                    (n.options.items = n.itemsAmount);
            },
            response: function () {
                var i,
                    n,
                    o = this;
                return o.options.responsive !== !0
                    ? !1
                    : ((n = t(e).width()),
                      (o.resizer = function () {
                          t(e).width() !== n &&
                              (o.options.autoPlay !== !1 &&
                                  e.clearInterval(o.autoPlayInterval),
                              e.clearTimeout(i),
                              (i = e.setTimeout(function () {
                                  (n = t(e).width()), o.updateVars();
                              }, o.options.responsiveRefreshRate)));
                      }),
                      t(e).resize(o.resizer),
                      void 0);
            },
            updatePosition: function () {
                var t = this;
                t.jumpTo(t.currentItem),
                    t.options.autoPlay !== !1 && t.checkAp();
            },
            appendItemsSizes: function () {
                var e = this,
                    i = 0,
                    n = e.itemsAmount - e.options.items;
                e.$owlItems.each(function (o) {
                    var s = t(this);
                    s.css({ width: e.itemWidth }).data("owl-item", Number(o)),
                        (0 === o % e.options.items || o === n) &&
                            (o > n || (i += 1)),
                        s.data("owl-roundPages", i);
                });
            },
            appendWrapperSizes: function () {
                var t = this,
                    e = t.$owlItems.length * t.itemWidth;
                t.$owlWrapper.css({ width: 2 * e, left: 0 }),
                    t.appendItemsSizes();
            },
            calculateAll: function () {
                var t = this;
                t.calculateWidth(), t.appendWrapperSizes(), t.loops(), t.max();
            },
            calculateWidth: function () {
                var t = this;
                t.itemWidth = Math.round(t.$elem.width() / t.options.items);
            },
            max: function () {
                var t = this,
                    e =
                        -1 *
                        (t.itemsAmount * t.itemWidth -
                            t.options.items * t.itemWidth);
                return (
                    t.options.items > t.itemsAmount
                        ? ((t.maximumItem = 0), (e = 0), (t.maximumPixels = 0))
                        : ((t.maximumItem = t.itemsAmount - t.options.items),
                          (t.maximumPixels = e)),
                    e
                );
            },
            min: function () {
                return 0;
            },
            loops: function () {
                var e,
                    i,
                    n,
                    o = this,
                    s = 0,
                    r = 0;
                for (
                    o.positionsInArray = [0], o.pagesInArray = [], e = 0;
                    e < o.itemsAmount;
                    e += 1
                )
                    (r += o.itemWidth),
                        o.positionsInArray.push(-r),
                        o.options.scrollPerPage === !0 &&
                            ((i = t(o.$owlItems[e])),
                            (n = i.data("owl-roundPages")),
                            n !== s &&
                                ((o.pagesInArray[s] = o.positionsInArray[e]),
                                (s = n)));
            },
            buildControls: function () {
                var e = this;
                (e.options.navigation === !0 || e.options.pagination === !0) &&
                    (e.owlControls = t('<div class="owl-controls"/>')
                        .toggleClass("clickable", !e.browser.isTouch)
                        .appendTo(e.$elem)),
                    e.options.pagination === !0 && e.buildPagination(),
                    e.options.navigation === !0 && e.buildButtons();
            },
            buildButtons: function () {
                var e = this,
                    i = t('<div class="owl-buttons"/>');
                e.owlControls.append(i),
                    (e.buttonPrev = t("<div/>", {
                        class: "owl-prev",
                        html: e.options.navigationText[0] || "",
                    })),
                    (e.buttonNext = t("<div/>", {
                        class: "owl-next",
                        html: e.options.navigationText[1] || "",
                    })),
                    i.append(e.buttonPrev).append(e.buttonNext),
                    i.on(
                        "touchstart.owlControls mousedown.owlControls",
                        'div[class^="owl"]',
                        function (t) {
                            t.preventDefault();
                        }
                    ),
                    i.on(
                        "touchend.owlControls mouseup.owlControls",
                        'div[class^="owl"]',
                        function (i) {
                            i.preventDefault(),
                                t(this).hasClass("owl-next")
                                    ? e.next()
                                    : e.prev();
                        }
                    );
            },
            buildPagination: function () {
                var e = this;
                (e.paginationWrapper = t('<div class="owl-pagination"/>')),
                    e.owlControls.append(e.paginationWrapper),
                    e.paginationWrapper.on(
                        "touchend.owlControls mouseup.owlControls",
                        ".owl-page",
                        function (i) {
                            i.preventDefault(),
                                Number(t(this).data("owl-page")) !==
                                    e.currentItem &&
                                    e.goTo(
                                        Number(t(this).data("owl-page")),
                                        !0
                                    );
                        }
                    );
            },
            updatePagination: function () {
                var e,
                    i,
                    n,
                    o,
                    s,
                    r,
                    a = this;
                if (a.options.pagination === !1) return !1;
                for (
                    a.paginationWrapper.html(""),
                        e = 0,
                        i = a.itemsAmount - (a.itemsAmount % a.options.items),
                        o = 0;
                    o < a.itemsAmount;
                    o += 1
                )
                    0 === o % a.options.items &&
                        ((e += 1),
                        i === o && (n = a.itemsAmount - a.options.items),
                        (s = t("<div/>", { class: "owl-page" })),
                        (r = t("<span></span>", {
                            text: a.options.paginationNumbers === !0 ? e : "",
                            class:
                                a.options.paginationNumbers === !0
                                    ? "owl-numbers"
                                    : "",
                        })),
                        s.append(r),
                        s.data("owl-page", i === o ? n : o),
                        s.data("owl-roundPages", e),
                        a.paginationWrapper.append(s));
                a.checkPagination();
            },
            checkPagination: function () {
                var e = this;
                return e.options.pagination === !1
                    ? !1
                    : (e.paginationWrapper.find(".owl-page").each(function () {
                          t(this).data("owl-roundPages") ===
                              t(e.$owlItems[e.currentItem]).data(
                                  "owl-roundPages"
                              ) &&
                              (e.paginationWrapper
                                  .find(".owl-page")
                                  .removeClass("active"),
                              t(this).addClass("active"));
                      }),
                      void 0);
            },
            checkNavigation: function () {
                var t = this;
                return t.options.navigation === !1
                    ? !1
                    : (t.options.rewindNav === !1 &&
                          (0 === t.currentItem && 0 === t.maximumItem
                              ? (t.buttonPrev.addClass("disabled"),
                                t.buttonNext.addClass("disabled"))
                              : 0 === t.currentItem && 0 !== t.maximumItem
                              ? (t.buttonPrev.addClass("disabled"),
                                t.buttonNext.removeClass("disabled"))
                              : t.currentItem === t.maximumItem
                              ? (t.buttonPrev.removeClass("disabled"),
                                t.buttonNext.addClass("disabled"))
                              : 0 !== t.currentItem &&
                                t.currentItem !== t.maximumItem &&
                                (t.buttonPrev.removeClass("disabled"),
                                t.buttonNext.removeClass("disabled"))),
                      void 0);
            },
            updateControls: function () {
                var t = this;
                t.updatePagination(),
                    t.checkNavigation(),
                    t.owlControls &&
                        (t.options.items >= t.itemsAmount
                            ? t.owlControls.hide()
                            : t.owlControls.show());
            },
            destroyControls: function () {
                var t = this;
                t.owlControls && t.owlControls.remove();
            },
            next: function (t) {
                var e = this;
                if (e.isTransition) return !1;
                if (
                    ((e.currentItem +=
                        e.options.scrollPerPage === !0 ? e.options.items : 1),
                    e.currentItem >
                        e.maximumItem +
                            (e.options.scrollPerPage === !0
                                ? e.options.items - 1
                                : 0))
                ) {
                    if (e.options.rewindNav !== !0)
                        return (e.currentItem = e.maximumItem), !1;
                    (e.currentItem = 0), (t = "rewind");
                }
                e.goTo(e.currentItem, t);
            },
            prev: function (t) {
                var e = this;
                if (e.isTransition) return !1;
                if (
                    (e.options.scrollPerPage === !0 &&
                    e.currentItem > 0 &&
                    e.currentItem < e.options.items
                        ? (e.currentItem = 0)
                        : (e.currentItem -=
                              e.options.scrollPerPage === !0
                                  ? e.options.items
                                  : 1),
                    e.currentItem < 0)
                ) {
                    if (e.options.rewindNav !== !0)
                        return (e.currentItem = 0), !1;
                    (e.currentItem = e.maximumItem), (t = "rewind");
                }
                e.goTo(e.currentItem, t);
            },
            goTo: function (t, i, n) {
                var o,
                    s = this;
                return s.isTransition
                    ? !1
                    : ("function" == typeof s.options.beforeMove &&
                          s.options.beforeMove.apply(this, [s.$elem]),
                      t >= s.maximumItem
                          ? (t = s.maximumItem)
                          : 0 >= t && (t = 0),
                      (s.currentItem = s.owl.currentItem = t),
                      s.options.transitionStyle !== !1 &&
                      "drag" !== n &&
                      1 === s.options.items &&
                      s.browser.support3d === !0
                          ? (s.swapSpeed(0),
                            s.browser.support3d === !0
                                ? s.transition3d(s.positionsInArray[t])
                                : s.css2slide(s.positionsInArray[t], 1),
                            s.afterGo(),
                            s.singleItemTransition(),
                            !1)
                          : ((o = s.positionsInArray[t]),
                            s.browser.support3d === !0
                                ? ((s.isCss3Finish = !1),
                                  i === !0
                                      ? (s.swapSpeed("paginationSpeed"),
                                        e.setTimeout(function () {
                                            s.isCss3Finish = !0;
                                        }, s.options.paginationSpeed))
                                      : "rewind" === i
                                      ? (s.swapSpeed(s.options.rewindSpeed),
                                        e.setTimeout(function () {
                                            s.isCss3Finish = !0;
                                        }, s.options.rewindSpeed))
                                      : (s.swapSpeed("slideSpeed"),
                                        e.setTimeout(function () {
                                            s.isCss3Finish = !0;
                                        }, s.options.slideSpeed)),
                                  s.transition3d(o))
                                : i === !0
                                ? s.css2slide(o, s.options.paginationSpeed)
                                : "rewind" === i
                                ? s.css2slide(o, s.options.rewindSpeed)
                                : s.css2slide(o, s.options.slideSpeed),
                            s.afterGo(),
                            void 0));
            },
            jumpTo: function (t) {
                var e = this;
                "function" == typeof e.options.beforeMove &&
                    e.options.beforeMove.apply(this, [e.$elem]),
                    t >= e.maximumItem || -1 === t
                        ? (t = e.maximumItem)
                        : 0 >= t && (t = 0),
                    e.swapSpeed(0),
                    e.browser.support3d === !0
                        ? e.transition3d(e.positionsInArray[t])
                        : e.css2slide(e.positionsInArray[t], 1),
                    (e.currentItem = e.owl.currentItem = t),
                    e.afterGo();
            },
            afterGo: function () {
                var t = this;
                t.prevArr.push(t.currentItem),
                    (t.prevItem = t.owl.prevItem =
                        t.prevArr[t.prevArr.length - 2]),
                    t.prevArr.shift(0),
                    t.prevItem !== t.currentItem &&
                        (t.checkPagination(),
                        t.checkNavigation(),
                        t.eachMoveUpdate(),
                        t.options.autoPlay !== !1 && t.checkAp()),
                    "function" == typeof t.options.afterMove &&
                        t.prevItem !== t.currentItem &&
                        t.options.afterMove.apply(this, [t.$elem]);
            },
            stop: function () {
                var t = this;
                (t.apStatus = "stop"), e.clearInterval(t.autoPlayInterval);
            },
            checkAp: function () {
                var t = this;
                "stop" !== t.apStatus && t.play();
            },
            play: function () {
                var t = this;
                return (
                    (t.apStatus = "play"),
                    t.options.autoPlay === !1
                        ? !1
                        : (e.clearInterval(t.autoPlayInterval),
                          (t.autoPlayInterval = e.setInterval(function () {
                              t.next(!0);
                          }, t.options.autoPlay)),
                          void 0)
                );
            },
            swapSpeed: function (t) {
                var e = this;
                "slideSpeed" === t
                    ? e.$owlWrapper.css(e.addCssSpeed(e.options.slideSpeed))
                    : "paginationSpeed" === t
                    ? e.$owlWrapper.css(
                          e.addCssSpeed(e.options.paginationSpeed)
                      )
                    : "string" != typeof t &&
                      e.$owlWrapper.css(e.addCssSpeed(t));
            },
            addCssSpeed: function (t) {
                return {
                    "-webkit-transition": "all " + t + "ms ease",
                    "-moz-transition": "all " + t + "ms ease",
                    "-o-transition": "all " + t + "ms ease",
                    transition: "all " + t + "ms ease",
                };
            },
            removeTransition: function () {
                return {
                    "-webkit-transition": "",
                    "-moz-transition": "",
                    "-o-transition": "",
                    transition: "",
                };
            },
            doTranslate: function (t) {
                return {
                    "-webkit-transform": "translate3d(" + t + "px, 0px, 0px)",
                    "-moz-transform": "translate3d(" + t + "px, 0px, 0px)",
                    "-o-transform": "translate3d(" + t + "px, 0px, 0px)",
                    "-ms-transform": "translate3d(" + t + "px, 0px, 0px)",
                    transform: "translate3d(" + t + "px, 0px,0px)",
                };
            },
            transition3d: function (t) {
                var e = this;
                e.$owlWrapper.css(e.doTranslate(t));
            },
            css2move: function (t) {
                var e = this;
                e.$owlWrapper.css({ left: t });
            },
            css2slide: function (t, e) {
                var i = this;
                (i.isCssFinish = !1),
                    i.$owlWrapper.stop(!0, !0).animate(
                        { left: t },
                        {
                            duration: e || i.options.slideSpeed,
                            complete: function () {
                                i.isCssFinish = !0;
                            },
                        }
                    );
            },
            checkBrowser: function () {
                var t,
                    n,
                    o,
                    s,
                    r = this,
                    a = "translate3d(0px, 0px, 0px)",
                    l = i.createElement("div");
                (l.style.cssText =
                    "  -moz-transform:" +
                    a +
                    "; -ms-transform:" +
                    a +
                    "; -o-transform:" +
                    a +
                    "; -webkit-transform:" +
                    a +
                    "; transform:" +
                    a),
                    (t = /translate3d\(0px, 0px, 0px\)/g),
                    (n = l.style.cssText.match(t)),
                    (o = null !== n && 1 === n.length),
                    (s = "ontouchstart" in e || e.navigator.msMaxTouchPoints),
                    (r.browser = { support3d: o, isTouch: s });
            },
            moveEvents: function () {
                var t = this;
                (t.options.mouseDrag !== !1 || t.options.touchDrag !== !1) &&
                    (t.gestures(), t.disabledEvents());
            },
            eventTypes: function () {
                var t = this,
                    e = ["s", "e", "x"];
                (t.ev_types = {}),
                    t.options.mouseDrag === !0 && t.options.touchDrag === !0
                        ? (e = [
                              "touchstart.owl mousedown.owl",
                              "touchmove.owl mousemove.owl",
                              "touchend.owl touchcancel.owl mouseup.owl",
                          ])
                        : t.options.mouseDrag === !1 &&
                          t.options.touchDrag === !0
                        ? (e = [
                              "touchstart.owl",
                              "touchmove.owl",
                              "touchend.owl touchcancel.owl",
                          ])
                        : t.options.mouseDrag === !0 &&
                          t.options.touchDrag === !1 &&
                          (e = [
                              "mousedown.owl",
                              "mousemove.owl",
                              "mouseup.owl",
                          ]),
                    (t.ev_types.start = e[0]),
                    (t.ev_types.move = e[1]),
                    (t.ev_types.end = e[2]);
            },
            disabledEvents: function () {
                var e = this;
                e.$elem.on("dragstart.owl", function (t) {
                    t.preventDefault();
                }),
                    e.$elem.on("mousedown.disableTextSelect", function (e) {
                        return t(e.target).is(
                            "input, textarea, select, option"
                        );
                    });
            },
            gestures: function () {
                function n(t) {
                    if (void 0 !== t.touches)
                        return { x: t.touches[0].pageX, y: t.touches[0].pageY };
                    if (void 0 === t.touches) {
                        if (void 0 !== t.pageX)
                            return { x: t.pageX, y: t.pageY };
                        if (void 0 === t.pageX)
                            return { x: t.clientX, y: t.clientY };
                    }
                }
                function o(e) {
                    "on" === e
                        ? (t(i).on(l.ev_types.move, r),
                          t(i).on(l.ev_types.end, a))
                        : "off" === e &&
                          (t(i).off(l.ev_types.move), t(i).off(l.ev_types.end));
                }
                function s(i) {
                    var s,
                        r = i.originalEvent || i || e.event;
                    if (3 === r.which) return !1;
                    if (!(l.itemsAmount <= l.options.items)) {
                        if (
                            l.isCssFinish === !1 &&
                            !l.options.dragBeforeAnimFinish
                        )
                            return !1;
                        if (
                            l.isCss3Finish === !1 &&
                            !l.options.dragBeforeAnimFinish
                        )
                            return !1;
                        l.options.autoPlay !== !1 &&
                            e.clearInterval(l.autoPlayInterval),
                            l.browser.isTouch === !0 ||
                                l.$owlWrapper.hasClass("grabbing") ||
                                l.$owlWrapper.addClass("grabbing"),
                            (l.newPosX = 0),
                            (l.newRelativeX = 0),
                            t(this).css(l.removeTransition()),
                            (s = t(this).position()),
                            (u.relativePos = s.left),
                            (u.offsetX = n(r).x - s.left),
                            (u.offsetY = n(r).y - s.top),
                            o("on"),
                            (u.sliding = !1),
                            (u.targetElement = r.target || r.srcElement);
                    }
                }
                function r(o) {
                    var s,
                        r,
                        a = o.originalEvent || o || e.event;
                    (l.newPosX = n(a).x - u.offsetX),
                        (l.newPosY = n(a).y - u.offsetY),
                        (l.newRelativeX = l.newPosX - u.relativePos),
                        "function" == typeof l.options.startDragging &&
                            u.dragging !== !0 &&
                            0 !== l.newRelativeX &&
                            ((u.dragging = !0),
                            l.options.startDragging.apply(l, [l.$elem])),
                        (l.newRelativeX > 8 || l.newRelativeX < -8) &&
                            l.browser.isTouch === !0 &&
                            (void 0 !== a.preventDefault
                                ? a.preventDefault()
                                : (a.returnValue = !1),
                            (u.sliding = !0)),
                        (l.newPosY > 10 || l.newPosY < -10) &&
                            u.sliding === !1 &&
                            t(i).off("touchmove.owl"),
                        (s = function () {
                            return l.newRelativeX / 5;
                        }),
                        (r = function () {
                            return l.maximumPixels + l.newRelativeX / 5;
                        }),
                        (l.newPosX = Math.max(Math.min(l.newPosX, s()), r())),
                        l.browser.support3d === !0
                            ? l.transition3d(l.newPosX)
                            : l.css2move(l.newPosX);
                }
                function a(i) {
                    var n,
                        s,
                        r,
                        a = i.originalEvent || i || e.event;
                    (a.target = a.target || a.srcElement),
                        (u.dragging = !1),
                        l.browser.isTouch !== !0 &&
                            l.$owlWrapper.removeClass("grabbing"),
                        (l.dragDirection = l.owl.dragDirection =
                            l.newRelativeX < 0 ? "left" : "right"),
                        0 !== l.newRelativeX &&
                            ((n = l.getNewPosition()),
                            l.goTo(n, !1, "drag"),
                            u.targetElement === a.target &&
                                l.browser.isTouch !== !0 &&
                                (t(a.target).on("click.disable", function (e) {
                                    e.stopImmediatePropagation(),
                                        e.stopPropagation(),
                                        e.preventDefault(),
                                        t(e.target).off("click.disable");
                                }),
                                (s = t._data(a.target, "events").click),
                                (r = s.pop()),
                                s.splice(0, 0, r))),
                        o("off");
                }
                var l = this,
                    u = {
                        offsetX: 0,
                        offsetY: 0,
                        baseElWidth: 0,
                        relativePos: 0,
                        position: null,
                        minSwipe: null,
                        maxSwipe: null,
                        sliding: null,
                        dargging: null,
                        targetElement: null,
                    };
                (l.isCssFinish = !0),
                    l.$elem.on(l.ev_types.start, ".owl-wrapper", s);
            },
            getNewPosition: function () {
                var t = this,
                    e = t.closestItem();
                return (
                    e > t.maximumItem
                        ? ((t.currentItem = t.maximumItem), (e = t.maximumItem))
                        : t.newPosX >= 0 && ((e = 0), (t.currentItem = 0)),
                    e
                );
            },
            closestItem: function () {
                var e = this,
                    i =
                        e.options.scrollPerPage === !0
                            ? e.pagesInArray
                            : e.positionsInArray,
                    n = e.newPosX,
                    o = null;
                return (
                    t.each(i, function (s, r) {
                        n - e.itemWidth / 20 > i[s + 1] &&
                        n - e.itemWidth / 20 < r &&
                        "left" === e.moveDirection()
                            ? ((o = r),
                              (e.currentItem =
                                  e.options.scrollPerPage === !0
                                      ? t.inArray(o, e.positionsInArray)
                                      : s))
                            : n + e.itemWidth / 20 < r &&
                              n + e.itemWidth / 20 >
                                  (i[s + 1] || i[s] - e.itemWidth) &&
                              "right" === e.moveDirection() &&
                              (e.options.scrollPerPage === !0
                                  ? ((o = i[s + 1] || i[i.length - 1]),
                                    (e.currentItem = t.inArray(
                                        o,
                                        e.positionsInArray
                                    )))
                                  : ((o = i[s + 1]), (e.currentItem = s + 1)));
                    }),
                    e.currentItem
                );
            },
            moveDirection: function () {
                var t,
                    e = this;
                return (
                    e.newRelativeX < 0
                        ? ((t = "right"), (e.playDirection = "next"))
                        : ((t = "left"), (e.playDirection = "prev")),
                    t
                );
            },
            customEvents: function () {
                var t = this;
                t.$elem.on("owl.next", function () {
                    t.next();
                }),
                    t.$elem.on("owl.prev", function () {
                        t.prev();
                    }),
                    t.$elem.on("owl.play", function (e, i) {
                        (t.options.autoPlay = i),
                            t.play(),
                            (t.hoverStatus = "play");
                    }),
                    t.$elem.on("owl.stop", function () {
                        t.stop(), (t.hoverStatus = "stop");
                    }),
                    t.$elem.on("owl.goTo", function (e, i) {
                        t.goTo(i);
                    }),
                    t.$elem.on("owl.jumpTo", function (e, i) {
                        t.jumpTo(i);
                    });
            },
            stopOnHover: function () {
                var t = this;
                t.options.stopOnHover === !0 &&
                    t.browser.isTouch !== !0 &&
                    t.options.autoPlay !== !1 &&
                    (t.$elem.on("mouseover", function () {
                        t.stop();
                    }),
                    t.$elem.on("mouseout", function () {
                        "stop" !== t.hoverStatus && t.play();
                    }));
            },
            lazyLoad: function () {
                var e,
                    i,
                    n,
                    o,
                    s,
                    r = this;
                if (r.options.lazyLoad === !1) return !1;
                for (e = 0; e < r.itemsAmount; e += 1)
                    (i = t(r.$owlItems[e])),
                        "loaded" !== i.data("owl-loaded") &&
                            ((n = i.data("owl-item")),
                            (o = i.find(".lazyOwl")),
                            "string" == typeof o.data("src")
                                ? (void 0 === i.data("owl-loaded") &&
                                      (o.hide(),
                                      i
                                          .addClass("loading")
                                          .data("owl-loaded", "checked")),
                                  (s =
                                      r.options.lazyFollow === !0
                                          ? n >= r.currentItem
                                          : !0),
                                  s &&
                                      n < r.currentItem + r.options.items &&
                                      o.length &&
                                      r.lazyPreload(i, o))
                                : i.data("owl-loaded", "loaded"));
            },
            lazyPreload: function (t, i) {
                function n() {
                    t.data("owl-loaded", "loaded").removeClass("loading"),
                        i.removeAttr("data-src"),
                        "fade" === r.options.lazyEffect
                            ? i.fadeIn(400)
                            : i.show(),
                        "function" == typeof r.options.afterLazyLoad &&
                            r.options.afterLazyLoad.apply(this, [r.$elem]);
                }
                function o() {
                    (a += 1),
                        r.completeImg(i.get(0)) || s === !0
                            ? n()
                            : 100 >= a
                            ? e.setTimeout(o, 100)
                            : n();
                }
                var s,
                    r = this,
                    a = 0;
                "DIV" === i.prop("tagName")
                    ? (i.css("background-image", "url(" + i.data("src") + ")"),
                      (s = !0))
                    : (i[0].src = i.data("src")),
                    o();
            },
            autoHeight: function () {
                function i() {
                    var i = t(s.$owlItems[s.currentItem]).height();
                    s.wrapperOuter.css("height", i + "px"),
                        s.wrapperOuter.hasClass("autoHeight") ||
                            e.setTimeout(function () {
                                s.wrapperOuter.addClass("autoHeight");
                            }, 0);
                }
                function n() {
                    (o += 1),
                        s.completeImg(r.get(0))
                            ? i()
                            : 100 >= o
                            ? e.setTimeout(n, 100)
                            : s.wrapperOuter.css("height", "");
                }
                var o,
                    s = this,
                    r = t(s.$owlItems[s.currentItem]).find("img");
                void 0 !== r.get(0) ? ((o = 0), n()) : i();
            },
            completeImg: function (t) {
                var e;
                return t.complete
                    ? ((e = typeof t.naturalWidth),
                      "undefined" !== e && 0 === t.naturalWidth ? !1 : !0)
                    : !1;
            },
            onVisibleItems: function () {
                var e,
                    i = this;
                for (
                    i.options.addClassActive === !0 &&
                        i.$owlItems.removeClass("active"),
                        i.visibleItems = [],
                        e = i.currentItem;
                    e < i.currentItem + i.options.items;
                    e += 1
                )
                    i.visibleItems.push(e),
                        i.options.addClassActive === !0 &&
                            t(i.$owlItems[e]).addClass("active");
                i.owl.visibleItems = i.visibleItems;
            },
            transitionTypes: function (t) {
                var e = this;
                (e.outClass = "owl-" + t + "-out"),
                    (e.inClass = "owl-" + t + "-in");
            },
            singleItemTransition: function () {
                function t(t) {
                    return { position: "relative", left: t + "px" };
                }
                var e = this,
                    i = e.outClass,
                    n = e.inClass,
                    o = e.$owlItems.eq(e.currentItem),
                    s = e.$owlItems.eq(e.prevItem),
                    r =
                        Math.abs(e.positionsInArray[e.currentItem]) +
                        e.positionsInArray[e.prevItem],
                    a =
                        Math.abs(e.positionsInArray[e.currentItem]) +
                        e.itemWidth / 2,
                    l =
                        "webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend";
                (e.isTransition = !0),
                    e.$owlWrapper
                        .addClass("owl-origin")
                        .css({
                            "-webkit-transform-origin": a + "px",
                            "-moz-perspective-origin": a + "px",
                            "perspective-origin": a + "px",
                        }),
                    s
                        .css(t(r, 10))
                        .addClass(i)
                        .on(l, function () {
                            (e.endPrev = !0), s.off(l), e.clearTransStyle(s, i);
                        }),
                    o.addClass(n).on(l, function () {
                        (e.endCurrent = !0), o.off(l), e.clearTransStyle(o, n);
                    });
            },
            clearTransStyle: function (t, e) {
                var i = this;
                t.css({ position: "", left: "" }).removeClass(e),
                    i.endPrev &&
                        i.endCurrent &&
                        (i.$owlWrapper.removeClass("owl-origin"),
                        (i.endPrev = !1),
                        (i.endCurrent = !1),
                        (i.isTransition = !1));
            },
            owlStatus: function () {
                var t = this;
                t.owl = {
                    userOptions: t.userOptions,
                    baseElement: t.$elem,
                    userItems: t.$userItems,
                    owlItems: t.$owlItems,
                    currentItem: t.currentItem,
                    prevItem: t.prevItem,
                    visibleItems: t.visibleItems,
                    isTouch: t.browser.isTouch,
                    browser: t.browser,
                    dragDirection: t.dragDirection,
                };
            },
            clearEvents: function () {
                var n = this;
                n.$elem.off(".owl owl mousedown.disableTextSelect"),
                    t(i).off(".owl owl"),
                    t(e).off("resize", n.resizer);
            },
            unWrap: function () {
                var t = this;
                0 !== t.$elem.children().length &&
                    (t.$owlWrapper.unwrap(),
                    t.$userItems.unwrap().unwrap(),
                    t.owlControls && t.owlControls.remove()),
                    t.clearEvents(),
                    t.$elem
                        .attr("style", t.$elem.data("owl-originalStyles") || "")
                        .attr("class", t.$elem.data("owl-originalClasses"));
            },
            destroy: function () {
                var t = this;
                t.stop(),
                    e.clearInterval(t.checkVisible),
                    t.unWrap(),
                    t.$elem.removeData();
            },
            reinit: function (e) {
                var i = this,
                    n = t.extend({}, i.userOptions, e);
                i.unWrap(), i.init(n, i.$elem);
            },
            addItem: function (t, e) {
                var i,
                    n = this;
                return t
                    ? 0 === n.$elem.children().length
                        ? (n.$elem.append(t), n.setVars(), !1)
                        : (n.unWrap(),
                          (i = void 0 === e || -1 === e ? -1 : e),
                          i >= n.$userItems.length || -1 === i
                              ? n.$userItems.eq(-1).after(t)
                              : n.$userItems.eq(i).before(t),
                          n.setVars(),
                          void 0)
                    : !1;
            },
            removeItem: function (t) {
                var e,
                    i = this;
                return 0 === i.$elem.children().length
                    ? !1
                    : ((e = void 0 === t || -1 === t ? -1 : t),
                      i.unWrap(),
                      i.$userItems.eq(e).remove(),
                      i.setVars(),
                      void 0);
            },
        };
        (t.fn.owlCarousel = function (e) {
            return this.each(function () {
                if (t(this).data("owl-init") === !0) return !1;
                t(this).data("owl-init", !0);
                var i = Object.create(n);
                i.init(e, this), t.data(this, "owlCarousel", i);
            });
        }),
            (t.fn.owlCarousel.options = {
                items: 5,
                itemsCustom: !1,
                itemsDesktop: [1199, 4],
                itemsDesktopSmall: [979, 3],
                itemsTablet: [768, 2],
                itemsTabletSmall: !1,
                itemsMobile: [479, 1],
                singleItem: !1,
                itemsScaleUp: !1,
                slideSpeed: 200,
                paginationSpeed: 800,
                rewindSpeed: 1e3,
                autoPlay: !1,
                stopOnHover: !1,
                navigation: !1,
                navigationText: ["prev", "next"],
                rewindNav: !0,
                scrollPerPage: !1,
                pagination: !0,
                paginationNumbers: !1,
                responsive: !0,
                responsiveRefreshRate: 200,
                responsiveBaseWidth: e,
                baseClass: "owl-carousel",
                theme: "owl-theme",
                lazyLoad: !1,
                lazyFollow: !0,
                lazyEffect: "fade",
                autoHeight: !1,
                jsonPath: !1,
                jsonSuccess: !1,
                dragBeforeAnimFinish: !0,
                mouseDrag: !0,
                touchDrag: !0,
                addClassActive: !1,
                transitionStyle: !1,
                beforeUpdate: !1,
                afterUpdate: !1,
                beforeInit: !1,
                afterInit: !1,
                beforeMove: !1,
                afterMove: !1,
                afterAction: !1,
                startDragging: !1,
                afterLazyLoad: !1,
            });
    })(jQuery, window, document);
