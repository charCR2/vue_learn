function Apromise ( executor ) {

    this.status = 'pending'
    this.reasonSuccess = ''
    this.reasonFail = ''
    this.onFulfilledFunc = [];//保存成功回调
    this.onRejectedFunc = [];//保存失败回调
    var that = this

    function resolve (success) {
        if (that.status === 'pending') {
            that.reasonSuccess = success;//保存成功结果
            setTimeout(()=>{
                that.onFulfilledFunc.forEach(fn => fn(success))
            })    
            that.status = 'resolved';
        }
    }

    function reject (fail) {
        if (that.status === 'pending') {
            that.reasonFail = fail;//保存成功结果
            setTimeout(()=>{
                that.onRejectedFunc.forEach(fn => fn(fail))
            })
            that.status = 'reject';
        }
    }

    executor(resolve, reject)
}

/**
*  Promise处理异步代码最强大的地方就是支持链式调用，这块也是最复杂的，规范中是这样定义的：

* 1.每个then方法都返回一个新的Promise对象（原理的核心）
* 2.如果then方法中显示地返回了一个Promise对象就以此对象为准，返回它的结果
* 3.如果then方法中返回的是一个普通值（如Number、String等）就使用此值包装成一个新的Promise对象返回。
* 4.如果then方法中没有return语句，就视为返回一个用Undefined包装的Promise对象
* 5.若then方法中出现异常，则调用失败态方法（reject）跳转到下一个then的onRejected
* 6.如果then方法没有传入任何回调，则继续向下传递（值的传递特性）。
*/

Apromise.prototype.then = function ( onFulfilled, onRejected ) {

    //解决Promise主体的异步操作

    if (this.status === 'pending') {
        //判断参数类型，是函数执行之
        if (typeof onFulfilled === 'function') {
            this.onFulfilledFunc.push(onFulfilled);
        }

        if (typeof onRejected === 'function') {
            this.onRejectedFunc.push(onRejected)
        }
    }

    if (this.status === 'resolved') {
        //判断参数类型，是函数执行之
        if (typeof onFulfilled === 'function') {
            setTimeout(()=>{
                onFulfilled(this.reasonSuccess);
            })
           
        }

    }
    if (this.status === 'reject') {
        if (typeof onRejected === 'function') {
            setTimeout(()=>{
                onRejected(this.reasonFail);
            })
        }
    }

    var promise2 = new Promise((resolve, reject) => {
        //代码略...
        if(this.status === 'resolved'){
            resolvePromise(promise2,this.reasonSuccess, resolve, reject)
        }else{
            resolvePromise(promise2,this.reasonFail, resolve, reject)
        }
    })  
    return promise2;
}

/**
  * 解析then返回值与新Promise对象
  * @param {Object} promise2 新的Promise对象 
  * @param {*} x 上一个then的返回值
  * @param {Function} resolve promise2的resolve
  * @param {Function} reject promise2的reject
  */
function resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
        reject(new TypeError('Promise发生了循环引用'));
    }
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        //可能是个对象或是函数
        try {
            let then = x.then; 
            if (typeof then === 'function') {
                let y = then.call(x, (y) => {
                    //递归调用，传入y若是Promise对象，继续循环
                    resolvePromise(promise2, y, resolve, reject);
                }, (r) => {
                    reject(r);
                });
            } else {
                resolve(x);
            }
        } catch (e) {
            reject(e);
        }
    
    } else {
        //是个普通值，最终结束递归
        resolve(x);
    }
}

console.log(1)
new Apromise( (resolve,reject) => {

    console.log(2)
    setTimeout(()=>{
        console.log(3)
    })
    resolve(4)
}).then((data)=>{
    console.log(data)
})
console.log(5)

// 1 2 5 3 4