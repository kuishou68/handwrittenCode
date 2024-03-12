/**
 * -------------------------------------------防抖-------------------------------------------
 * @param func
 * @param wait
 * @returns {(function(...[*]): void)|*}
 */
const debounce = (func, wait=50) => {
    // 初始化定时器ID
     let timerId = 0;
     return function(...args){
        // 如果已经设定过了定时器，则清空上一次的定时器
        if(timerId){
            clearTimeout(timerId);
        }
        // 开始一个新的定时器，延时执行传入的方法
        timerId = setTimeout(()=>{
            func.apply(this, args)
        }, wait)
     }
}

/**
 *  -------------------------------------------节流-------------------------------------------
 * @returns {(function(...[*]): void)|*}
 */
const throttle = () => {
    // 上一次执行时间
    let lastTime = 0;
    return function(...args){
        // 当前时间
         let now = +new Date();
         // 如果当前时间和上一次执行函数时间差异大于等到时间，则执行函数
         if(now - lastTime > wait){
            lastTime = now;
            func.apply(this, args);
         }
    }
}

/**
 * -------------------------------------------发布订阅模式-------------------------------------------
 */
class EventEmiter {
    constructor() {
      // 事件对象，存放订阅的名字和事件
      this._events = {}
    }
    // 订阅事件的方法
    on(eventName,callback) {
      if(!this._events) {
        this._events = {}
      }
      // 合并之前订阅的cb
      this._events[eventName] = [...(this._events[eventName] || []),callback]
    }
    // 触发事件的方法
    emit(eventName, ...args) {
      if(!this._events[eventName]) {
        return
      }
      // 遍历执行所有订阅的事件
      this._events[eventName].forEach(fn=>fn(...args))
    }
    off(eventName,cb) {
      if(!this._events[eventName]) {
        return
      }
      // 删除订阅的事件
      this._events[eventName] = this._events[eventName].filter(fn=>fn != cb && fn.l != cb)
    }
    // 绑定一次 触发后将绑定的移除掉 再次触发掉
    once(eventName,callback) {
      const one = (...args)=>{
        // 等callback执行完毕在删除
        callback(args)
        this.off(eventName,one)
      }
      one.l = callback // 自定义属性
      this.on(eventName,one)
    }
  }

// 测试用例
let event = new EventEmiter()

let login1 = function(...args) {
  console.log('login success1', args)
}
let login2 = function(...args) {
  console.log('login success2', args)
}
event.on('login',login1)
event.once('login',login2)
event.off('login',login1) // 解除订阅
event.emit('login', 1,2,3,4,5)
event.emit('login', 6,7,8,9)
event.emit('login', 10,11,12)


// 简易写法
class EventEmiter {
    constructor(){
        this.events = {};
    }
    on(eventName, fn){
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        this.events[eventName].push(fn);
    }
    off(eventName, fn){
        if(!this.events[eventName]){
            return;
        }
        if(!fn){
            this.events[eventName] = undefined;
            return;
        }
        this.events[eventName] = this.events[eventName].filter((item) =>  item !== fn )
    }
    emit(eventName, ...args){
        // 没有订阅，直接return
        if(!this.events[eventName]){
            return;
        }
        // 开始发布消息
        this.events[eventName].forEach((item) => item(...args))
    }
}

// 测试用例-来自拼多多
const eventEmitter = new EventEmiter();
const event1Listener = (a, b) => {
    console.log(`event1：a=${a}, b=${b}`);
}

const event2Listener = () => {
    console.log("event2");
}

const event3Listener = () => {
    console.log("event3");
}

eventEmitter.on('event1', event1Listener);
eventEmitter.on('event2', event2Listener);

console.log(eventEmitter);

eventEmitter.emit('event1', 1, 2); // 输出 ”event1: a=1, b=2
eventEmitter.emit('event2'); // 输出 ”event2

eventEmitter.on('event2', event3Listener);
eventEmitter.emit('event2'); // 输出 ”event2 和 event3

eventEmitter.off('event1', event1Listener);
// eventEmitter.emit('event1'); // 不输出任何内容

/**
 * -------------------------------------------发布者模式-------------------------------------------
 */
class Subject{
    constructor(){
        this.state = "";
        this.observers = [];
    }
    // 添加到订阅者列表
    attach(observer){
        this.observers.push(observer);
    }
    // 设置状态
    setState(newState){
        this.state = newState;
        this.observers.forEach((item) => item.update(this))
    }
}

class Observer{
    constructor(name){
        this.name = name;
    }
    update(student){
        console.log(this.name, "更新了，当前学生状态为", student.state)
    }
}

// 测试用例
let student = new Subject('学生');

let parent = new Observer('父母');
let teacher = new Observer('老师');

// 被观察者存储观察者的前提，需要先接纳观察者
student.attach(parent);
student.attach(teacher);
student.setState('被欺负了');


/**
 * -------------------------------------------实现call方法：-------------------------------------------
 *
 * call做了什么:
 * 将函数设为对象的属性
 * 执行和删除这个函数
 * 指定this到函数并传入给定参数执行函数
 * 如果不传入参数，默认指向 window
 */

// 相当于在obj上调用fn方法，this指向obj
// var obj = {fn: function(){console.log(this)}}
// obj.fn() fn内部的this指向obj
// call就是模拟了这个过程
// context 相当于obj

/*Function.prototype.myCall = function(context = window, ...args) {
    // 值类型，变为对象
    if (typeof context !== 'object') {
        context = new Object(context)
    }

    // args 传递过来的参数
    // this 表示调用call的函数fn
    // context 是call传入的this

    // 在context上加一个唯一值，不会出现属性名称的覆盖
    let fnKey = Symbol();
    // 相等于 obj[fnKey] = fn
    context[fnKey] = this; // this 就是当前的函数

    // 绑定了this
    let result = context[fnKey](...args);// 相当于 obj.fn()执行 fn内部this指向context(obj)

    // 清理掉 fn ，防止污染（即清掉obj上的fnKey属性）
    delete context[fnKey];

    // 返回结果
    return result;
};*/

Function.prototype.myCall = function(context=window, ...args){
    // 值类型转对象类型
    if(typeof context != "object"){
        context = new Object(context)
    }
    // 适用symbol作为key, 保存当前this
    let fnKey = Symbol();
    context[fnKey] = this;
    // 绑定this
    let result = context[fnKey](...args);
    // 清除fn，防止污染
    delete context[fnKey];
    return result;
}


//用法：f.call(this,arg1)
function f(a,b){
    console.log(a+b)
    console.log(this.name)
}
let obj={
    name:1
}
f.myCall(obj,1,2) // 不传obj，this指向window


/**
 * -------------------------------------------实现apply方法-------------------------------------------
 * 思路: 利用this的上下文特性。apply其实就是改一下参数的问题
 */

// Function.prototype.myApply = function(context = window, args) {  // 这里传参和call传参不一样
//     if (typeof context !== 'object') context = new Object(context) // 值类型，变为对象
//
//     // args 传递过来的参数
//     // this 表示调用call的函数
//     // context 是apply传入的this
//
//     // 在context上加一个唯一值，不会出现属性名称的覆盖
//     let fnKey = Symbol()
//     context[fnKey] = this; // this 就是当前的函数
//
//     // 绑定了this
//     let result = context[fnKey](...args);
//
//     // 清理掉 fn ，防止污染
//     delete context[fnKey];
//
//     // 返回结果
//     return result;
// }

Function.prototype.myApply = function(context=window, args){
    // 值类型转对象类型
    if(typeof context !== 'object'){
        context = new Object(context);
    }
    // 用symbol作为key，保存当前this
    let fnKey = Symbol();
    context[fnKey] = this;
    // 绑定this
    let result = context[fnKey](...args);
    // 清空obj上的fnkey属性，防止污染
    delete context[fnKey];
    return result;
}

// 测试用例
// 使用
function f(a,b){
    console.log(a,b)
    console.log(this.name)
}
let obj={
    name:'张三'
}
f.myApply(obj,[1,2])


/**
 * -------------------------------------------实现bind函数：-------------------------------------------
 * bind 返回了一个函数，对于函数来说有两种方式调用，一种是直接调用，一种是通过 new 的方式，我们先来说直接调用的方式
 * 对于直接调用来说，这里选择了 apply 的方式实现，但是对于参数需要注意以下情况：因为 bind 可以实现类似这样的代码 f.bind(obj, 1)(2)，所以我们需要将两边的参数拼接起来
 * 最后来说通过 new 的方式，对于 new 的情况来说，不会被任何方式改变 this，所以对于这种情况我们需要忽略传入的 this
 * 箭头函数的底层是bind，无法改变this，只能改变参数
 */
/*Function.prototype.myBind = function(context = window, ...args) {
    // context 是 bind 传入的 this
    // args 是 bind 传入的各个参数
    // this表示调用bind的函数
    let self = this; // fn.bind(obj) self就是fn

    //返回了一个函数，...innerArgs为实际调用时传入的参数
    let fBound = function(...innerArgs) {
        // this instanceof fBound为true表示构造函数的情况。如new func.bind(obj)
        // 当作为构造函数时，this 指向实例，此时 this instanceof fBound 结果为 true，可以让实例获得来自绑定函数的值
        // 当作为普通函数时，this 默认指向 window，此时结果为 false，将绑定函数的 this 指向 context
        return self.apply( // 函数执行
            this instanceof fBound ? this : context,
            args.concat(innerArgs) // 拼接参数
        );
    }

    // 如果绑定的是构造函数，那么需要继承构造函数原型属性和方法：保证原函数的原型对象上的属性不丢失
    // 实现继承的方式: 使用Object.create
    fBound.prototype = Object.create(this.prototype);
    return fBound;
}*/
Function.prototype.myBind = function(context=window, ...args){
    let self = this;
    // 返回一个新的函数
    let fBound = function(...innerArgs){
        // 做构造函数，this指向实例，返回原函数上的所有属性和方法
        // 做普通函数，this指向window，
        return self.apply(this instanceof fBound ? this : context, args.concat(innerArgs))
    }
    // 新的函数需要包含原函数上的属性和方法
    fBound.prototype = Object.create(this.prototype)
    return fBound;
}


// 测试
var obj = {
    x: 42,
};

function getX(y) {
    return this.x + y;
}

var boundFunc = getX.myBind(obj, 10);
console.log(boundFunc(5)); // 输出 57


// 测试用例
function Person(name, age) {
    console.log('Person name：', name);
    console.log('Person age：', age);
    console.log('Person this：', this); // 构造函数this指向实例对象
}

// 构造函数原型的方法
Person.prototype.say = function() {
    console.log('person say');
}

// 普通函数
function normalFun(name, age) {
    console.log('普通函数 name：', name);
    console.log('普通函数 age：', age);
    console.log('普通函数 this：', this);  // 普通函数this指向绑定bind的第一个参数 也就是例子中的obj
}

var obj = {
    name: 'poetries',
    age: 18
}

// 先测试作为构造函数调用
var bindFun = Person.myBind(obj, 'poetry1') // undefined
var a = new bindFun(10) // Person name: poetry1、Person age: 10、Person this: fBound {}
a.say() // person say

// 再测试作为普通函数调用
var bindNormalFun = normalFun.myBind(obj, 'poetry2') // undefined
bindNormalFun(12)
// 普通函数name: poetry2
// 普通函数 age: 12
// 普通函数 this: {name: 'poetries', age: 18}


/**
 * -------------------------------------------实现观察者模式-------------------------------------------
 * 发布订阅者模式 和 观察者模式的区别？
 *
 * 发布/订阅模式是观察者模式的一种变形，两者区别在于，发布/订阅模式在观察者模式的基础上，在目标和观察者之间增加一个调度中心。
 * 观察者模式是由 具体目标调度，比如当事件触发，Subject 就会去调用观察者的方法，所以观察者模式的订阅者与发布者之间是存在依赖的。
 * 发布/订阅模式由 统一调度中心调用，因此发布者和订阅者不需要知道对方的存在。
 *
 */
class Subject{
    constructor(){
        this.state = ""; // 观察者状态
        this.observers = []; // 被观察者列表
    }
    // 添加到观察者列表
    attach(obser){
        this.observers.push(obser);
    }
    // 更新观察者状态
    setState(newState){
        this.state = newState;
        this.observers.forEach((item) => { item.update(this) })
    }
}

class Observer {
    constructor(name){
        this.name = name; // 被观察者名称
    }
    update(student){
        console.log(this.name, "发布了，当前学生状态", student.state);
    }
}


let student = new Subject('学生');

let parent = new Observer('父母');
let teacher = new Observer('老师');

// 被观察者存储观察者的前提，需要先接纳观察者
student.attach(parent);
student.attach(teacher);
student.setState('被欺负了');


/**
 * -------------------------------------------实现 instanceOf-------------------------------------------
 * 步骤1：先取得当前类的原型，当前实例对象的原型链
 * 步骤2：一直循环（执行原型链的查找机制）
 */
// 实例.__ptoto__ === 构造函数.prototype
// function _instanceof(instance, classOrFunc) {
//     // 由于instance要检测的是某对象，需要有一个前置判断条件
//     //基本数据类型直接返回false
//     if(typeof instance !== 'object' || instance == null) return false;
//
//     let proto = Object.getPrototypeOf(instance); // 等价于 instance.__ptoto__
//     while(proto) { // 当proto == null时，说明已经找到了Object的基类null 退出循环
//         // 实例的原型等于当前构造函数的原型
//         if(proto == classOrFunc.prototype) return true;
//         // 沿着原型链__ptoto__一层一层向上查
//         proto = Object.getPrototypeOf(proto); // 等价于 proto.__ptoto__
//     }
//     return false
// }

function _instanceof(instance, func){
    // 基本数据类型直接返回false
    if(typeof instance !== 'object' || instance == null){
        return false;
    }
    // 获取构造函数原型
    let proto = Object.getPrototypeOf(instance);
    // 开启一个循环，比较构造函数的原型和实例原型是否相等，直到原型链返回null为止
    while(proto){
        if(proto === func.prototype){
            return true;
        }
        proto = Object.getPrototypeOf(proto)
    }
    return false;
}

console.log('test', _instanceof(null, Array)) // false
console.log('test', _instanceof([], Array)) // true
console.log('test', _instanceof('', Array)) // false
console.log('test', _instanceof({}, Object)) // true


/**
 * -------------------------------------------实现Promise相关方法-------------------------------------------
 * 可以把 Promise 看成一个状态机。初始是 pending 状态，可以通过函数 resolve和 reject ，将状态转变为 resolved或者 rejected 状态，状态一旦改变就不能再次变化。
 * then 函数会返回一个 Promise 实例，并且该返回值是一个新的实例而不是之前的实例。因为 Promise 规范规定除了 pending 状态，其他状态是不可以改变的，如果返回的是一个相同实例的话，多个 then 调用就失去意义了。
 * 对于 then来说，本质上可以把它看成是 flatMap
 */

// 类编写方式
class MyPromiseClass {
    constructor(fn) {
        this.state = 'PENDING';
        this.value = '';
        this.resolvedCallbacks = [];
        this.rejectedCallbacks = [];
        fn(this.resolve.bind(this), this.reject.bind(this));
    }
    resolve(value) {
        if (this.state === 'PENDING') {
            this.state = 'RESOLVED';
            this.value = value;
            this.resolvedCallbacks.map(cb => cb(value));
        }
    }
    reject(value) {
        if (this.state === 'PENDING') {
            this.state = 'REJECTED';
            this.value = value;
            this.rejectedCallbacks.map(cb => cb(value));
        }
    }
    then(onFulfilled, onRejected) {
        if (this.state === 'PENDING') {
            this.resolvedCallbacks.push(onFulfilled);
            this.rejectedCallbacks.push(onRejected);
        }
        if (this.state === 'RESOLVED') {
            onFulfilled(this.value);
        }
        if (this.state === 'REJECTED') {
            onRejected(this.value);
        }
    }
}


// 函数编写方式
function MyPromiseFunction(constructor) {
    let self = this;
    self.status = "pending"   // 定义状态改变前的初始状态
    self.value = undefined;   // 定义状态为resolved的时候的状态
    self.reason = undefined;  // 定义状态为rejected的时候的状态
    function resolve(value) {
        if(self.status === "pending") {
            self.value = value;
            self.status = "resolved";
        }
    }
    function reject(reason) {
        if(self.status === "pending") {
            self.reason = reason;
            self.status = "rejected";
        }
    }
    // 捕获构造异常
    try {
        constructor(resolve,reject);
    } catch(e) {
        reject(e);
    }
}
// 添加 then 方法
MyPromiseFunction.prototype.then = function(onFulfilled, onRejected) {
    let self = this;
    switch(self.status) {
        case "resolved":
            onFulfilled(self.value);
            break;
        case "rejected":
            onRejected(self.reason);
            break;
        default:
    }
}

var p = new MyPromiseFunction(function(resolve,reject) {
    resolve(1)
});
p.then(function(x) {
    console.log(x) // 1
})


/**
 * -------------------------------------------Promise.all 实现-------------------------------------------
 * 传入参数为一个空的可迭代对象，则直接进行resolve。
 * 如果参数中有一个promise失败，那么Promise.all返回的promise对象失败。
 * 在任何情况下，Promise.all 返回的 promise 的完成状态的结果都是一个数组
 */

// Promise.all = function(promises) {
//     return new Promise((resolve, reject) => {
//         let result = [];
//         let index = 0;
//         let len = promises.length;
//         if(len === 0) {
//             resolve(result);
//             return;
//         }
//
//         for(let i = 0; i < len; i++) {
//             // 为什么不直接 promise[i].then, 因为promise[i]可能不是一个promise
//             Promise.resolve(promises[i]).then(data => {
//                 result[i] = data;
//                 index++;
//                 if(index === len) resolve(result);
//             }).catch(err => {
//                 reject(err);
//             })
//         }
//     })
// }

Promise.all = function(promises){
    return new Promise((resolve, reject) => {
        let result = []; // 结果数组
        let index = 0;
        let len = promises.length;
        if(len === 0){
            resolve(result);
            return;
        }

        // 遍历全部promises
        for(let i = 0; i < len; i++){
            Promise.resolve(promises[i]).then(data => {
                result[i] = data; // 保存结果数组
                index++;
                // 遍历到最后一个promise时，返回全部结果数组
                if(index === len){
                    resolve(result)
                }
            }).catch(err => {
                reject(err)
            })
        }
    })
}


