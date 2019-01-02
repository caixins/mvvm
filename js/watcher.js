function Watcher(vm, expOrFn, cb) {
    this.cb = cb;
    this.expOrFn = expOrFn;
    this.vm = vm;
    this.depIds = {};
    this.getter = typeof expOrFn == 'function' ? expOrFn : this.parseGetter(expOrFn);

    this.value = this.get();
}

Watcher.prototype = {
    update() {
        this.run();
    },
    run() {
        var val = this.get();
        var oldVal = this.value;
        if (val != oldVal) {
            this.value=val;
            this.cb.call(this.vm,val,oldVal);
        }
    },
    addDep(dep) {
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this);
            this.depIds[dep.id]=dep
        }
    },
    get() {
        Dep.target=this;
        var val=this.getter.call(this.vm,this.vm);
        Dep.target=null;
        return val;
    },
    parseGetter(exp) {
        var exps=exp.split('.');
        return function(obj){
            exps.forEach(key => {
                obj=obj[key];
            });
            return obj;
        }
    }
}