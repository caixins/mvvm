function Observer(data) {
    this.data = data;
    this.bindData(data);
}

Observer.prototype = {
    bindData(data) {
        Object.keys(data).forEach((key) => {
            this.defineReactive(data, key, data[key]);
        })
    },
    defineReactive(data, key, val) {
        var dep = new Dep();
        //子属性为对象，监听子属性
        this.defineChild(val);
        var me=this;
        Object.defineProperty(data, key, {
            configurable: true,
            enumerable: true,
            set (newVal) {
                if (newVal == val) {
                    return
                }
                val = newVal;
                me.defineChild(val);
                //通知订阅者更新
                dep.notify();
            },
            get() {
                Dep.target&&dep.depend();
                return val
            }
        })
    },
    defineChild(val) {
        if (!val && typeof val === "object") {
            new Observer(val)
        };
    }
}

var uuid = 0;
function Dep() {
    this.id = uuid++;
    this.subs = [];
}

Dep.prototype = {
    addSub(sub) {
        this.subs.push(sub)
    },
    depend(){
        Dep.target.addDep(this);
    },
    removeSub(sub) {
        var index = this.subs.indexOf(sub);
        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}