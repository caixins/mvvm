function Compile(element, vm) {
    this.$vm = vm;
    this.$el = this.isElement(element) ? element : document.querySelector(element);

    if (this.$el) {
        this.$fragment = this.createFragment();
        this.compileElement(this.$fragment);
        this.$el.append(this.$fragment);
    }
}

Compile.prototype = {
    createFragment() {
        var fragment = document.createDocumentFragment(), child;

        while (childe = this.$el.firstChild) {
            fragment.appendChild(childe)
        }
        return fragment;
    },
    compileElement(node) {
        [...node.childNodes].forEach(node => {
            if (this.isElement(node)) {
                this.compile(node)
            } else if (this.isTextNode(node) && /\{\{(.*)\}\}/.test(node.textContent)) {
                //编译{{**********}}
                this.compileText(node, RegExp.$1);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node)
            }
        });
    },
    compile(node) {
        [...node.attributes].forEach(attribute => {
            var attributeName = attribute.name
            if (this.isDirective(attributeName)) {
                var directive = attributeName.substr(2),
                    val = attribute.value;
                //事件指令
                if (this.isEventDirective(directive)) {
                    compileUtil.eventHandler(node, this.$vm, val, directive);
                } else {
                    compileUtil[directive] && compileUtil[directive](node, this.$vm, val)
                }
            }
        })
    },
    compileText(node, exp) {
        compileUtil.text(node, this.$vm, exp)
    },
    isDirective(dir) {
        return dir.startsWith('v-')
    },
    isEventDirective(dir) {
        return dir.startsWith('on')
    },
    isElement(el) {
        return el.nodeType === 1
    },
    isTextNode(node) {
        return node.nodeType == 3
    }
}

compileUtil = {
    text(node, vm, exp) {
        this.bind(node, vm, exp, "text");
    },
    html(node, vm, exp) {
        this.bind(node, vm, exp, "html");
    },
    model(node, vm, exp) {
        this.bind(node, vm, exp, "model");
        var val = this.getVMVal(vm, exp)
        node.addEventListener('input', (e) => {
            var newVal = e.target.value;
            if (val === newVal) {
                return
            }
            this.setVMVal(newVal, vm, exp);
            val = newVal;
        })
    },
    class(node, vm, exp) {
        this.bind(node, vm, exp, "class");
    },
    bind(node, vm, exp, dir) {
        var updateFn = this.updateFn[dir + "Updater"];
        updateFn && updateFn(node, this.getVMVal(vm, exp));
        new Watcher(vm,exp,function(value,oldVal){
            updateFn && updateFn(node,value,oldVal);
        })
    },
    eventHandler(node, vm, exp, dir) {
        var eventType = dir.split(":")[1];
        var cb = vm.$options.methods && vm.$options.methods[exp];
        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false)
        }
    },
    getVMVal(vm, exp) {
        var data = vm;
        exp.split('.').forEach(key => {
            data = data[key]
        })
        return data;
    },
    setVMVal(newVal, vm, exp) {
        var data = vm;
        exp = exp.split('.');
        exp.forEach((key, i) => {
            if (i < exp.length - 1) {
                data = data[key];
            } else {
                data[key] = newVal
            }
        })
    },
    updateFn: {
        textUpdater(node, text) {
            node.textContent = text
        },
        htmlUpdater(node, html) {
            node.innerHTML = html;
        },
        modelUpdater(node, val) {
            node.value = val
        },
        classUpdater(node, val, oldVal) {
            node.className = node.className.replace(oldVal, '') + ' ' + val;
        }
    }
}