function MVVM(options = {}) {
    this.$options = options;
    var data = this._data = options.data || {};
    //数据代理
    Object.keys(data).forEach(key => {
        this._proxyData(key)
    })

    new Observer(data);
    
    this.$watch(options.watch||{});

    this.$computed(options.computed||{});
    
    this.$compile=new Compile(options.el||document.body,this)
}

MVVM.prototype = {
    $watch(watch){
        Object.keys(watch).forEach(key=>{
            if(typeof watch[key]=="function"){
                new Watcher(this, key, cb)
            }
        })
    },
    _proxyData(key) {
        Object.defineProperty(this, key, {
            configurable: true,
            enumerable: true,
            set: newVal => {
                this._data[key] = newVal;
            },
            get: () => {
                return this._data[key]
            },
        })
    },
    $computed(computed){
        Object.keys(computed).forEach(key=>{
            Object.defineProperty(this,key,{
                configurable:true,
                enumerable:true,
                get:typeof computed[key]==="function"?
                    computed[key]:computed[key].get,
                set:function(){}
            })
        })
    }
}