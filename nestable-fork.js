! function($, window, document, undefined) {
    function Plugin(element, options) {
        this.w = $(document), this.el = $(element), options || (options = defaults), options.rootClass !== undefined && "dd" !== options.rootClass && (options.listClass = options.listClass ? options.listClass : options.rootClass + "-list", options.itemClass = options.itemClass ? options.itemClass : options.rootClass + "-item", options.dragClass = options.dragClass ? options.dragClass : options.rootClass + "-dragel", options.handleClass = options.handleClass ? options.handleClass : options.rootClass + "-handle", options.collapsedClass = options.collapsedClass ? options.collapsedClass : options.rootClass + "-collapsed", options.placeClass = options.placeClass ? options.placeClass : options.rootClass + "-placeholder", options.noDragClass = options.noDragClass ? options.noDragClass : options.rootClass + "-nodrag", options.noChildrenClass = options.noChildrenClass ? options.noChildrenClass : options.rootClass + "-nochildren", options.emptyClass = options.emptyClass ? options.emptyClass : options.rootClass + "-empty"), this.options = $.extend({}, defaults, options), this.options.json !== undefined && this._build(), this.init()
    }
    var hasPointerEvents = function() {
            var el = document.createElement("div"),
                docEl = document.documentElement;
            if (!("pointerEvents" in el.style)) return !1;
            el.style.pointerEvents = "auto", el.style.pointerEvents = "x", docEl.appendChild(el);
            var supports = window.getComputedStyle && "auto" === window.getComputedStyle(el, "").pointerEvents;
            return docEl.removeChild(el), !!supports
        }(),
        defaults = {
            contentCallback: function(item) {
                return item.content ? item.content : item.id
            },
            listNodeName: "ol",
            itemNodeName: "li",
            handleNodeName: "div",
            contentNodeName: "span",
            rootClass: "dd",
            listClass: "dd-list",
            itemClass: "dd-item",
            dragClass: "dd-dragel",
            handleClass: "dd-handle",
            contentClass: "dd-content",
            collapsedClass: "dd-collapsed",
            placeClass: "dd-placeholder",
            noDragClass: "dd-nodrag",
            noChildrenClass: "dd-nochildren",
            emptyClass: "dd-empty",
            expandBtnHTML: '<button class="dd-expand" data-action="expand" type="button">Expand</button>',
            collapseBtnHTML: '<button class="dd-collapse" data-action="collapse" type="button">Collapse</button>',
            group: 0,
            maxDepth: 5,
            threshold: 20,
            fixedDepth: !1,
            fixed: !1,
            includeContent: !1,
            callback: function(l, e) {},
            listRenderer: function(children, options) {
                var html = "<" + options.listNodeName + ' class="' + options.listClass + '">';
                return html += children, html += "</" + options.listNodeName + ">"
            },
            itemRenderer: function(item_attrs, content, children, options, item) {
                var item_attrs_string = $.map(item_attrs, function(value, key) {
                        return " " + key + '="' + value + '"'
                        
                    }).join(" "),
                    html = "<" + options.itemNodeName + item_attrs_string + ">";
                return html += "<" + options.handleNodeName + ' class="' + options.handleClass + '">', html += "<" + options.contentNodeName + ' class="' + options.contentClass + '">', html += content, html += "</" + options.contentNodeName + ">", html += "</" + options.handleNodeName + ">", html += children, html += "</" + options.itemNodeName + ">"
            }
        };
    Plugin.prototype = {
        init: function() {
            var list = this;
            list.reset(), list.el.data("nestable-group", this.options.group), list.placeEl = $('<div class="' + list.options.placeClass + '"/>'), $.each(this.el.find(list.options.itemNodeName + "." + list.options.itemClass), function(k, el) {
                var item = $(el),
                    parent = item.parent();
                list.setParent(item), parent.hasClass(list.options.collapsedClass) && list.collapseItem(parent.parent())
            }), list.el.on("click", "button", function(e) {
                if (!list.dragEl) {
                    var target = $(e.currentTarget),
                        action = target.data("action"),
                        item = target.parent(list.options.itemNodeName + "." + list.options.itemClass);
                    "collapse" === action && list.collapseItem(item), "expand" === action && list.expandItem(item)
                }
            });
            var onStartEvent = function(e) {
                    var handle = $(e.target);
                    if (e.originalEvent && (e = e.originalEvent), !handle.hasClass(list.options.handleClass)) {
                        if (handle.closest("." + list.options.noDragClass).length) return;
                        handle = handle.closest("." + list.options.handleClass)
                    }
                    if (!handle.hasClass(list.options.noDragClass) && handle.length && !list.dragEl) {
                        if (0 === e.type.indexOf("mouse")) {
                            if (0 !== e.button) return
                        } else if (1 !== e.touches.length) return;
                        e.preventDefault(), 0 === e.type.indexOf("mouse") ? list.dragStart(e) : list.dragStart(e.touches[0])
                    }
                },
                onMoveEvent = function(e) {
                    list.dragEl && (e.preventDefault(), e.originalEvent && (e = e.originalEvent), 0 === e.type.indexOf("mouse") ? list.dragMove(e) : list.dragMove(e.touches[0]))
                },
                onEndEvent = function(e) {
                    list.dragEl && (e.preventDefault(), e.originalEvent && (e = e.originalEvent), 0 === e.type.indexOf("mouse") ? list.dragStop(e) : list.dragStop(e.touches[0]))
                };
            list.el[0].addEventListener("touchstart", onStartEvent, !1), window.addEventListener("touchmove", onMoveEvent, !1), window.addEventListener("touchend", onEndEvent, !1), list.el.on("mousedown", onStartEvent), list.w.on("mousemove", onMoveEvent), list.w.on("mouseup", onEndEvent)
        },
        _build: function() {
            function escapeHtml(text) {
                var map = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"
                };
                return text + "".replace(/[&<>"']/g, function(m) {
                    return map[m]
                })
            }

            function filterClasses(classes) {
                var new_classes = {};
                for (var k in classes) new_classes[classes[k]] = classes[k];
                return new_classes
            }

            function createClassesString(item, options) {
                var classes = item.classes || {};
                "string" == typeof classes && (classes = [classes]);
                var item_classes = filterClasses(classes);
                return item_classes[options.itemClass] = options.itemClass, $.map(item_classes, function(val) {
                    return val
                }).join(" ")
            }

            function createDataAttrs(attr) {
                attr = $.extend({}, attr), delete attr.children, delete attr.classes, delete attr.content;
                var data_attrs = {};
                return $.each(attr, function(key, value) {
                    "object" == typeof value && (value = JSON.stringify(value)), data_attrs["data-" + key] = escapeHtml(value)
                }), data_attrs
            }

            function buildList(items, options) {
                if (!items) return "";
                var children = "";
                return $.each(items, function(index, sub) {
                    children += buildItem(sub, options)
                }), options.listRenderer(children, options)
            }

            function buildItem(item, options) {
                var item_attrs = createDataAttrs(item);
                item_attrs.class = createClassesString(item, options);
                var content = options.contentCallback(item),
                    children = buildList(item.children, options);
                return options.itemRenderer(item_attrs, content, children, options, item)
            }
            var json = this.options.json;
            "string" == typeof json && (json = JSON.parse(json)), $(this.el).html(buildList(json, this.options))
        },
        serialize: function() {
            var data, list = this,
                step = function(level) {
                    var array = [],
                        items = level.children(list.options.itemNodeName + "." + list.options.itemClass);
                    return items.each(function() {
                        var li = $(this),
                            item = $.extend({}, li.data()),
                            sub = li.children(list.options.listNodeName + "." + list.options.listClass);
                        if (list.options.includeContent) {
                            var content = li.find("." + list.options.contentClass).html();
                            content && (item.content = content)
                        }
                        sub.length && (item.children = step(sub)), array.push(item)
                    }), array
                };
            return data = step(list.el.find(list.options.listNodeName + "." + list.options.listClass).first())
        },
        asNestedSet: function() {
            function traverse(item, depth, lft) {
                var id, pid, rgt = lft + 1;
                return $(item).children(o.listNodeName + "." + o.listClass).children(o.itemNodeName + "." + o.itemClass).length > 0 && (depth++, $(item).children(o.listNodeName + "." + o.listClass).children(o.itemNodeName + "." + o.itemClass).each(function() {
                    rgt = traverse($(this), depth, rgt)
                }), depth--), id = $(item).attr("data-id"), pid = $(item).parent(o.listNodeName + "." + o.listClass).parent(o.itemNodeName + "." + o.itemClass).attr("data-id") || null, id && ret.push({
                    id: id,
                    parent_id: pid,
                    depth: depth,
                    lft: lft,
                    rgt: rgt
                }), lft = rgt + 1
            }
            var list = this,
                o = list.options,
                depth = -1,
                ret = [],
                lft = 1,
                items = list.el.find(o.listNodeName + "." + o.listClass).first().children(o.itemNodeName + "." + o.itemClass);
            return items.each(function() {
                lft = traverse(this, depth + 1, lft)
            }), ret = ret.sort(function(a, b) {
                return a.lft - b.lft
            })
        },
        returnOptions: function() {
            return this.options
        },
        serialise: function() {
            return this.serialize()
        },
        reset: function() {
            this.mouse = {
                offsetX: 0,
                offsetY: 0,
                startX: 0,
                startY: 0,
                lastX: 0,
                lastY: 0,
                nowX: 0,
                nowY: 0,
                distX: 0,
                distY: 0,
                dirAx: 0,
                dirX: 0,
                dirY: 0,
                lastDirX: 0,
                lastDirY: 0,
                distAxX: 0,
                distAxY: 0
            }, this.moving = !1, this.dragEl = null, this.dragRootEl = null, this.dragDepth = 0, this.hasNewRoot = !1, this.pointEl = null
        },
        expandItem: function(li) {
            li.removeClass(this.options.collapsedClass)
        },
        collapseItem: function(li) {
            var lists = li.children(this.options.listNodeName + "." + this.options.listClass);
            lists.length && li.addClass(this.options.collapsedClass)
        },
        expandAll: function() {
            var list = this;
            list.el.find(list.options.itemNodeName + "." + list.options.itemClass).each(function() {
                list.expandItem($(this))
            })
        },
        collapseAll: function() {
            var list = this;
            list.el.find(list.options.itemNodeName + "." + list.options.itemClass).each(function() {
                list.collapseItem($(this))
            })
        },
        setParent: function(li) {
            li.children(this.options.listNodeName + "." + this.options.listClass).length && (li.prepend($(this.options.expandBtnHTML)), li.prepend($(this.options.collapseBtnHTML)))
        },
        unsetParent: function(li) {
            li.removeClass(this.options.collapsedClass), li.children("[data-action]").remove(), li.children(this.options.listNodeName + "." + this.options.listClass).remove()
        },
        dragStart: function(e) {
            var mouse = this.mouse,
                target = $(e.target),
                dragItem = target.closest(this.options.itemNodeName + "." + this.options.itemClass);
            this.placeEl.css("height", dragItem.height()), mouse.offsetX = e.pageX - dragItem.offset().left, mouse.offsetY = e.pageY - dragItem.offset().top, mouse.startX = mouse.lastX = e.pageX, mouse.startY = mouse.lastY = e.pageY, this.dragRootEl = this.el, this.dragEl = $(document.createElement(this.options.listNodeName)).addClass(this.options.listClass + " " + this.options.dragClass), this.dragEl.css("width", dragItem.outerWidth()), this.setIndexOfItem(dragItem), dragItem.after(this.placeEl), dragItem[0].parentNode.removeChild(dragItem[0]), dragItem.appendTo(this.dragEl), $(document.body).append(this.dragEl), this.dragEl.css({
                left: e.pageX - mouse.offsetX,
                top: e.pageY - mouse.offsetY
            });
            var i, depth, items = this.dragEl.find(this.options.itemNodeName + "." + this.options.itemClass);
            for (i = 0; i < items.length; i++) depth = $(items[i]).parents(this.options.listNodeName + "." + this.options.listClass).length, depth > this.dragDepth && (this.dragDepth = depth)
        },
        setIndexOfItem: function(item, index) {
            "undefined" == typeof index && (index = []), index.unshift(item.index()), $(item[0].parentNode)[0] !== this.dragRootEl[0] ? this.setIndexOfItem($(item[0].parentNode), index) : this.dragEl.data("indexOfItem", index)
        },
        restoreItemAtIndex: function(dragElement) {
            function placeElement(currentEl, dragElement) {
                0 === indexArray[indexArray.length - 1] ? $(currentEl).prepend(dragElement.clone()) : $(currentEl.children[indexArray[indexArray.length - 1] - 1]).after(dragElement.clone())
            }
            var indexArray = this.dragEl.data("indexOfItem"),
                currentEl = this.el;
            for (i = 0; i < indexArray.length; i++) {
                if (indexArray.length - 1 === parseInt(i)) return void placeElement(currentEl, dragElement);
                currentEl = currentEl[0].children[indexArray[i]]
            }
        },
        dragStop: function(e) {
            var el = this.dragEl.children(this.options.itemNodeName + "." + this.options.itemClass).first();
            el[0].parentNode.removeChild(el[0]), this.placeEl.replaceWith(el), this.hasNewRoot ? (this.options.fixed === !0 ? this.restoreItemAtIndex(el) : this.el.trigger("lostItem"), this.dragRootEl.trigger("gainedItem")) : this.dragRootEl.trigger("change"), this.dragEl.remove(), this.options.callback.call(this, this.dragRootEl, el), this.reset()
        },
        dragMove: function(e) {
            var list, parent, prev, next, depth, opt = this.options,
                mouse = this.mouse;
            this.dragEl.css({
                left: e.pageX - mouse.offsetX,
                top: e.pageY - mouse.offsetY
            }), mouse.lastX = mouse.nowX, mouse.lastY = mouse.nowY, mouse.nowX = e.pageX, mouse.nowY = e.pageY, mouse.distX = mouse.nowX - mouse.lastX, mouse.distY = mouse.nowY - mouse.lastY, mouse.lastDirX = mouse.dirX, mouse.lastDirY = mouse.dirY, mouse.dirX = 0 === mouse.distX ? 0 : mouse.distX > 0 ? 1 : -1, mouse.dirY = 0 === mouse.distY ? 0 : mouse.distY > 0 ? 1 : -1;
            var newAx = Math.abs(mouse.distX) > Math.abs(mouse.distY) ? 1 : 0;
            if (!mouse.moving) return mouse.dirAx = newAx, void(mouse.moving = !0);
            mouse.dirAx !== newAx ? (mouse.distAxX = 0, mouse.distAxY = 0) : (mouse.distAxX += Math.abs(mouse.distX), 0 !== mouse.dirX && mouse.dirX !== mouse.lastDirX && (mouse.distAxX = 0), mouse.distAxY += Math.abs(mouse.distY), 0 !== mouse.dirY && mouse.dirY !== mouse.lastDirY && (mouse.distAxY = 0)), mouse.dirAx = newAx, mouse.dirAx && mouse.distAxX >= opt.threshold && (mouse.distAxX = 0, prev = this.placeEl.prev(opt.itemNodeName + "." + opt.itemClass), mouse.distX > 0 && prev.length && !prev.hasClass(opt.collapsedClass) && !prev.hasClass(opt.noChildrenClass) && (list = prev.find(opt.listNodeName + "." + opt.listClass).last(), depth = this.placeEl.parents(opt.listNodeName + "." + opt.listClass).length, depth + this.dragDepth <= opt.maxDepth && (list.length ? (list = prev.children(opt.listNodeName + "." + opt.listClass).last(), list.append(this.placeEl)) : (list = $("<" + opt.listNodeName + "/>").addClass(opt.listClass), list.append(this.placeEl), prev.append(list), this.setParent(prev)))), mouse.distX < 0 && (next = this.placeEl.next(opt.itemNodeName + "." + opt.itemClass), next.length || (parent = this.placeEl.parent(), this.placeEl.closest(opt.itemNodeName + "." + opt.itemClass).after(this.placeEl), parent.children().length || this.unsetParent(parent.parent()))));
            var isEmpty = !1;
            if (hasPointerEvents || (this.dragEl[0].style.visibility = "hidden"), this.pointEl = $(document.elementFromPoint(e.pageX - document.body.scrollLeft, e.pageY - (window.pageYOffset || document.documentElement.scrollTop))), hasPointerEvents || (this.dragEl[0].style.visibility = "visible"), this.pointEl.hasClass(opt.handleClass) && (this.pointEl = this.pointEl.closest(opt.itemNodeName + "." + opt.itemClass)), this.pointEl.hasClass(opt.emptyClass)) isEmpty = !0;
            else if (!this.pointEl.length || !this.pointEl.hasClass(opt.itemClass)) return;
            var pointElRoot = this.pointEl.closest("." + opt.rootClass),
                isNewRoot = this.dragRootEl.data("nestable-id") !== pointElRoot.data("nestable-id");
            if (!mouse.dirAx || isNewRoot || isEmpty) {
                if (isNewRoot && opt.group !== pointElRoot.data("nestable-group")) return;
                if (this.options.fixedDepth && this.dragDepth + 1 !== this.pointEl.parents(opt.listNodeName + "." + opt.listClass).length) return;
                if (depth = this.dragDepth - 1 + this.pointEl.parents(opt.listNodeName + "." + opt.listClass).length, depth > opt.maxDepth) return;
                var before = e.pageY < this.pointEl.offset().top + this.pointEl.height() / 2;
                parent = this.placeEl.parent(), isEmpty ? (list = $(document.createElement(opt.listNodeName)).addClass(opt.listClass), list.append(this.placeEl), this.pointEl.replaceWith(list)) : before ? this.pointEl.before(this.placeEl) : this.pointEl.after(this.placeEl), parent.children().length || this.unsetParent(parent.parent()), this.dragRootEl.find(opt.itemNodeName + "." + opt.itemClass).length || this.dragRootEl.append('<div class="' + opt.emptyClass + '"/>'), this.dragRootEl = pointElRoot, isNewRoot && (this.hasNewRoot = this.el[0] !== this.dragRootEl[0])
            }
        }
    }, $.fn.nestable = function(params) {
        var lists = this,
            retval = this;
        return "Nestable" in window || (window.Nestable = {}, Nestable.counter = 0), lists.each(function() {
            var plugin = $(this).data("nestable");
            plugin ? "string" == typeof params && "function" == typeof plugin[params] && (retval = plugin[params]()) : (Nestable.counter++, $(this).data("nestable", new Plugin(this, params)), $(this).data("nestable-id", Nestable.counter))
        }), retval || lists
    }
}(window.jQuery || window.Zepto, window, document);