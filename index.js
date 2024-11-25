/**
 * -------------------------------------------防抖-------------------------------------------
 *  固定时间后再执行某一事件，如果在固定时间内重复触发，则重新计时
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
 * 固定时间内只执行一次，如果在固定时间内重复执行，只有一次生效
 * @returns {(function(...[*]): void)|*}
 */
const throttle = (func, wait=50) => {
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

Function.prototype.myApply = function(context=window, args){
    // 值类型转对象类型
    if(typeof context !== 'object'){
        context = new Object(context)
    }
    // Symbol 做key, 绑定this
    let fnKey = new Symbol();
    context[fnKey] = this;
    // 接收参数
    let result = context[fnKey](...args);
    //  清空obj上的fnkey属性，防止污染
    delete context[fnKey];
    return result;
}

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



Function.prototype.myBind1 = function(context=window, ...args){
    let self = this;
    let fnBound = function(...innerArgs){
        // 做构造函数使用，this指向实例，包含原函数所有属性和方法
        // 做普通函数使用，this指向windows
        return self.apply(this instanceof fnBound ? this : context, args.concat(innerArgs))
    }
    // 新函数需要包含原函数所有属性和方法
    fnBound.prototype = Object.create(this.prototype);
    return fnBound;
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

function MyPromise(constructor){
    let self = this;
    self.state = "pending"
    self.resolvedValue = undefined;
    self.rejectedValue = undefined;

    resolve(value){
        if(self.state === "pendng"){
            self.state = 'resolved';
            self.resolvedState = value;
        }
    }

    reject(value){
        if(self.state === "pending"){
            self.state = "rejected";
            self.rejectedValue = value;
        }
    }

    // 异常处理
    try{
        constructor(resolve, reject);
    } catch(e){
        reject(e)
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


/**
 * -------------------------------------------实现promise.race-------------------------------------------
 * 只要有一个promise执行完，直接返回
 */
Promise.race = function(promises) {
    return new Promise((resolve, reject) => {
        let len = promises.length;
        if(len === 0) return;
        for(let i = 0; i < len; i++) {
            Promise.resolve(promises[i]).then(data => {
                resolve(data);
                return;
            }).catch(err => {
                reject(err);
                return;
            })
        }
    })
}



/**
 * -------------------------------------------实现async/await-------------------------------------------
 * 核心：传递给我一个Generator函数，把函数中的内容基于Iterator迭代器的特点一步步的执行
 */


/**
 * -------------------------------------------ES6的 Object.create-------------------------------------------
 * Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的 __proto__
 */

function create(proto){
    // 创建一个新函数
    function F(){}
    // 将传入的函数挂在新函数原型上
    F.prototype = proto;
    // 返回合并之后的新函数
    return new F();
}


/**
 * -------------------------------------------ES6的 Object.is-------------------------------------------
 * Object.is不会转换被比较的两个值的类型，这点和===更为相似，他们之间也存在一些区别
 * NaN在===中是不相等的，而在Object.is中是相等的
 * +0和-0在===中是相等的，而在Object.is中是不相等的
 */
Object.is = function(x, y){
    // x === y 的情况，判断+0 和-0
    if(x === y){
        // 1/+0为正无穷，1/-0 为负无穷
        return x !== 0 || 1/x === 1/y;
    }
    // x !== y，判断NaN
    return x !== x && y !== y;
}


/**
 * -------------------------------------------forEach-------------------------------------------
 */
Array.prototype.myForEach = function(callback, context=window){
    for(let i = 0; i < this.length; i++){
         // 入参必须为函数，同时返回第一项为item，第二项为index
        typeof callback == 'function' && callback.call(context, this[i], i)
    }
}

/**
 * -------------------------------------------find-------------------------------------------
 */
Array.prototype.myFind = function(callback){
    for(let i = 0; i < this.length; i++){
        if(callback(this[i], i)){
            return this[i]
        }
    }
}

/**
 * -------------------------------------------findIndex-------------------------------------------
 */
Array.prototype.myFindIndex = function(callback){
    for(let i = 0; i < this.length; i++){
        if(callback(this[i], i)){
            return i;
        }
    }
}

/**
 * -------------------------------------------filter-------------------------------------------
 */
Array.prtotype.myFilter = function(callback, context=window){
    let arr = Array.prototype.slice.call(this);
    let newArr = [];
    for(let i = 0; i < arr.length; i++){
        if(callback.apply(context, [arr[i], i, this])){
            newArr.push(arr[i])
        }
    }
    return newArr;
}

/**
 * -------------------------------------------map-------------------------------------------
 */
Array.prototype.myMap = function(callback, context=window){
    let arr = Array.prototype.slice.call(this);
    let newArr = [];
    for(let i = 0; i < arr.length; i++){
        let item = callback.call(context, arr[i], i, this)
        if(item){
            newArr.push(item);
        }
    }
    return newArr;
}

/**
 * -------------------------------------------reduce-------------------------------------------
 */
Array.prototype.myReduce = function(callback, init){
    let arr = Array.prototype.slice.call(this);
    // 开始循环位置，取决于是否传入第二个参数
    let initIndex = arguments.length === 1 ? 1 : 0; // 数组遍历项
    let acc = arguments.length === 1 ? arr[0] : init;// 累加器
    for(let i = initIndex; i < arr.length; i++){
        acc = callback(acc, arr[i], i, arr)
    }
    return acc;
}

Array.prototype.myReduce1 = function(fn, init){
    let arr = Array.prototype.slice.call(this);
    let initIndex = arguments.length === 1?1:0;
    let acc = arguments.length === 1?arr[0]:init;
    for(let i=0; i<arr.length; i++){
        acc = fn(acc, arr[i], i, arr)
    }
    return acc;
}

// 测试用例
const array = [15, 16, 17, 18, 19];

function reducer(accumulator, currentValue, index) {
    const returns = accumulator + currentValue;
    console.log(
        `accumulator: ${accumulator}, currentValue: ${currentValue}, index: ${index}, returns: ${returns}`,
    );
    return returns;
}

const result = array.myReduce(reducer);
console.log("result", result);

/**
 * -------------------------------------------every-------------------------------------------
 * every() 方法测试一个数组内的所有元素是否都能通过指定函数的测试。它返回一个布尔值
 * */
Array.prototype.myEvery = function(callback, context=window){
    let arr = Array.prototype.slice.call(this);
    let falg = true;
    for(let i = 0; i < arr.length; i++){
        if(!callback.apply(context, [arr[i], i, this])){
            falg = false;
            break;
        }
    }
    return falg;
}

/**
 * -------------------------------------------some-------------------------------------------
 * some() 方法测试数组中是否至少有一个元素通过了由提供的函数实现的测试。
 * 如果在数组中找到一个元素使得提供的函数返回 true，则返回 true；否则返回 false。它不会修改数组。
 * */
Array.prototype.mySome = function(callback, context=window){
    let arr = Array.prototype.slice.call(this);
    let falg = false;
    for(let i = 0; i < arr.length; i++){
        if(callback.apply(context, [arr[i], i, this])){
            falg = true;
            break;
        }
    }
    return falg;
}

/**
 * -------------------------------------------flat-------------------------------------------
 * flat() 方法创建一个新的数组，并根据指定深度递归地将所有子数组元素拼接到新的数组中。
 * 递归处理 depth 指定要提取嵌套数组的结构深度，默认值为 1。
 */
Array.prototype.myFlag = function(depth=1){
    let result = []; //结果数组
    let fn = function(arr){
        for(let i = 0; i < arr.length; i++){
            // 是数组进行递归
            if(Array.isArray(arr[i])){
                fn(arr[i])
            } else {
                // 不是则添加到结果数组中
                result.push(arr[i])
            }
        }
    }
    return result;
}

Array.prototype.myFlat1 = function(deep=1){
    let res = [];
    deep--;
    for(let i=0; i<this.length; i++){
        const item = this[i];
        if(Array.isArray(item) && deep >=0){
            res = res.concat(item.myFlat1(deep))
        } else {
            res.push(item)
        }
    }
    return res;
}

// forEach 会自动去除空格
const eachFlat = (arr = [], depth = 1) => {
    const result = [];
    (function flat(arr, depth) {
      arr.forEach((item) => {
        if (Array.isArray(item) && depth > 0) {
          flat(item, depth - 1)
        } else {
          result.push(item)
        }
      })
    })(arr, depth)
    return result;
 }


// 扩展运算符写法
Array.prototype.myFlag1 = function(depth){
    while(arr.some(Array.isArray)){
        arr = [].concat(...arr);
    }
}



/**
 * -------------------------------------------Array.isArray-------------------------------------------
 * Array.isArray() 静态方法用于确定传递的值是否是一个数组。
 */
Array.myArray = function(val){
    // 调用顶级对象上的toString方法转换成[object Array]形式
    return Object.prototype.toString.call(val) === '[object Array]';
}

/**
 * -------------------------------------------数组去重-------------------------------------------
 *
 */
// ES6 的 Set 去重
function distinct2(arr){
    return Array.from(new Set(arr));
}

// Array.filter 配合 includes
function distinct1(a,b){
    let arr = a.concat(b);
    return arr.filter((item) => {
        return arr.includes(item);
    })
}

// reduce
var arr = [
    { name: "张三", age: "18" },
    { name: "张三", age: "19" },
    { name: "张三", age: "20" },
    { name: "李四", age: "19" },
    { name: "王五", age: "20" },
    { name: "赵六", age: "21" }
];
var temp = {};
arr = arr.resuce((prev, curr) => {
    if(!temp[curr.name]){
        temp[curr.name] = true;
        prev.push(curr);
    }
    return prev;
}, [])


// 双层循环
function distinct(arr){
    let len = arr.length;
    for(let i=0; i<len; i++){
        for(let j=i+1; j<len; j++){
            if(arr[i] === arr[j]){
                arr.splice(j, 1); // splice 会改变数组长度 len 和下标j减1
                len--;
                j--;
            }
        }
    }
}

/**
 * -------------------------------------------Proxy-------------------------------------------
 *
 */
function chain(value) {
    const handler = {
        get: function(obj, prop){
            if(prop === "end"){
                return obj.value;
            }
            if(typeof window[prop] === "function"){
                obj.value = window[prop](obj.value);
                return proxy;
            }
            return obj[prop];
        }
    };
    const proxy = new Proxy({value}, handler);
    return proxy;
}
// 测试用例
function increase(val){
    return val + 1;
}
function decrease(val){
    return val - 1;
}
function double(val){
    return val * 2;
}
let test1 = chain(3).increase.double.end;
console.log(test1);


/**
 * -------------------------------------------冒泡排序-------------------------------------------
 * 从第一个元素开始，重复比较相邻的两项，小的放前面，大的放后面
 * 平均时间复杂度 O(n^2)
 */
function bubbleSort(arr) {
    let len = arr.length;
    for(let i = 0; i < len; i++){
        let flag = false;
        for(let j = 0; j < len-1; j++){
            if(arr[j] > arr[j+1]){
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]]
                flag = true;
            }
        }
        // 若日一次交换也没有发生，则说明数组有序，直接返回
        if(!flag) return arr;
    }
    return arr;
}

/**
 * -------------------------------------------选择排序-------------------------------------------
 * 循环遍历数组，每次都找出当前范围内的最小值，把它放到当前范围的头部；然后缩小排序范围，重复这个过程；
 * 时间复杂度 O(n^2)
 */
function selectSort(arr){
    let len = arr.length;
    let minIndex; // 最小值索引
    for(let i = 0; i < len-1; i++){
        // 初始化最小索引
        minIndex = i;
        for(let j = i; j < len; j++){
            // 如果当前值小于最小值索引，更新最小值
            if(arr[j] < arr[minIndex]){
                minIndex = j
            }
        }
        // 交换位置
        if(minIndex !== i){
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
        }
    }
    return arr;
}


/**
 * -------------------------------------------插入排序-------------------------------------------
 * 前面的元素序列都是有序的，每次向右移动发现比自己大的，就需要为当前元素腾出一个新的位置
 * 时间复杂度  O(n^2)
 */
function insetSort(arr){
    let len = arr.length;
    let temp; // 当前需要插入的元素
    for(let i = 1; i < len; i++){
        // 寻找自己应该有的定位
        let j = i;
        temp = arr[i];
        // j前面一个元素比temp大时，将该元素后移一位，为temp让出位置
        while(j > 0 && arr[j-1] > temp){
            arr[j] = arr[j-1]
            j--
        }
        // 循环让位，最后得到的j就是temp的索引
        arr[j] = temp
    }
    return arr;
}

/**
 * https://interview.poetries.top/algorithm/algorithm-interview/20-%E6%8E%92%E5%BA%8F%E7%AE%97%E6%B3%95%E4%B8%93%E9%A2%98%EF%BC%88%E4%B8%8B%EF%BC%89.html#%E5%BD%92%E5%B9%B6%E6%8E%92%E5%BA%8F
 * -------------------------------------------归并排序-------------------------------------------
 * 分治思想，将数组从中间分割为两半，再分割子数组，直到子数组只有一个元素为止；
 * 将规模为1的子数组两两排序合并为2的子数组；
 * 时间复杂度 O(n log(n))
 */
function mergeSort(arr){
    let len = arr.length;
    if(len <= 1) return arr;
    let mid = Math.floor(len/2); // 分割点
    let leftArr = mergeSort(arr.slice(0, mid)); // 递归分割左子数组
    let rightArr = mergeSort(arr.slice(mid, len)); // 递归分割右子数组
    return mergeArr(leftArr, rightArr);
}

function mergeArr(leftArr, rightArr){
    // 初始化两个指针
    let i=0, j = 0;
    let res = [];
    let leftLen = leftArr.length;
    let rightLen = rightArr.length;
    // 合并子数组
    while(i < leftLen && j < rightLen){
        if(leftArr[i] < rightArr[j]){
            res.push(leftArr[i])
            i++;
        } else {
            res.push(rightArr[j])
            j++;
        }
    }
    // 如果其中一个子数组被合并完全，则直接拼接另一个子数组的剩余部分;
    if(i < leftLen){
        return res.concat(leftArr.slice(i))
    } else {
        return res.concat(rightArr.slice(j))
    }
}

function mergeSort(arr){
    let len = arr.length;
    if(len <= 1) return arr;
    let mid = Math.floor(len/2); // 切割点
    let leftArr = mergeSort(arr.slice(0, mid)); // 递归分割左子数组
    let rightArr = mergeSort(arr.slice(mid, len)); // 递归分割右子数组
    return mergeArr(leftArr, rightArr);
}

function mergeArr(leftArr, rightArr){
    let res = [];
    let i=0, j=0;
    let leftLen = leftArr.length;
    let rightLen = rightArr.length;
    while(i < leftArr && j < rightArr){
        if(leftArr[i] < rightArr[j]){
            res.push(leftArr[i])
            i++;
        } else {
            res.push(rightArr[j]);
            j++;
        }
    }
    // 如果其中一个子数组被合并完，则直接拼接到另一个子数组剩余部分
    if(i < leftLen){
        return res.concat(leftArr.slice(i));
    } else {
        return res.concat(rightArr.slice(j));
    }
}

/**
 * -------------------------------------------快速排序-------------------------------------------
 * 分治思想，快排不会把真的数组分割开来再合并到一个新的数组中去，而是直接在原有数组的内部进行排序
 * 1、从数列中挑选一个基准，所有要比基准小的放前面，大的放后面，递归这个过程；
 */
function quickSort(arr, left=0, right=arr.length-1){
    // 定义递归边界，若数组只有一个元素，则没有排序的必要
    if(arr.length > 1){
        // 下一次划分左右子数组的索引位
        const lineIndex = partition(arr, left, right);
        // 如果左右子数组的长度不小于1，则递归这个子数组
        if(left < lineIndex-1){
            quickSort(arr, left, lineIndex-1)
        }
        // 如果右边子数组的长度不小于1，则递归这个子数组
        if(lineIndex < right){
            quickSort(arr, lineIndex, right)
        }
    }
    return arr;
}

function partition(arr, left, right){
    // 基准
    let pivot = arr[Math.floor(left + (right - left) / 2)];
    let i = left;
    let j = right;
    // 当左右指针不越界时，循环执行以下逻辑
    while(i<=j){
        // 左指针所指元素小于基准值，则右移左指针
        while(arr[i] < pivot) i++;
        while(arr[j] > pivot) j--;
        // 若i<=j 交互左右两测
        if(i<=j){
            [arr[i], arr[j]] = [arr[j], arr[i]]
            i++;
            j--;
        }
    }
    // 返回左指针索引，作为下一次划分左右子数组的依据
    return i;
}


// -------------------------------------------快速排序 另一实现方式-------------------------------------------
function quickSort(arr, left, right) {
    var len = arr.length,
        partitionIndex,
        left = typeof left != 'number' ? 0 : left,
        right = typeof right != 'number' ? len - 1 : right;

    if (left < right) {
        partitionIndex = partition(arr, left, right);
        quickSort(arr, left, partitionIndex-1);
        quickSort(arr, partitionIndex+1, right);
    }
    return arr;
}

function partition(arr, left ,right) {     // 分区操作
    var pivot = left,                      // 设定基准值（pivot）
        index = pivot + 1;
    for (var i = index; i <= right; i++) {
        if (arr[i] < arr[pivot]) {
            swap(arr, i, index);
            index++;
        }
    }
    swap(arr, pivot, index - 1);
    return index-1;
}

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

console.log(quickSort([5, 1, 3, 6, 2, 0, 7]))


/**
 * -------------------------------------------两数之和-------------------------------------------
 * 输入：numbers = [2,7,11,15], target = 9
 * 输出：[1,2]
 * 解释：2 与 7 之和等于目标数 9 。因此 index1 = 1, index2 = 2 。返回 [1, 2] 。
 */
var twoSum = function(nums, target) {
    let res = []
    let len = nums.length;
    let map = new Map();
    if(nums.length < 2) return res
    for(let i = 0; i < len; i++){
        let diff = target - nums[i];
        if(map.has(diff)){
            return [map.get(diff), i]
        }
        map.set(nums[i], i)
    }
};


/**
 * -------------------------------------------三数之和-------------------------------------------
 *  给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请
 *
 *  示例 1：
 *     输入：nums = [-1,0,1,2,-1,-4]
 *     输出：[[-1,-1,2],[-1,0,1]]
 *     解释：
 *     nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
 *     nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
 *     nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
 *     不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
 *     注意，输出的顺序和三元组的顺序并不重要。
 *
 *  示例 2：
 *     输入：nums = [0,1,1]
 *     输出：[]
 *     解释：唯一可能的三元组和不为 0 。
 *
 *  示例 3：
 *     输入：nums = [0,0,0]
 *     输出：[[0,0,0]]
 *     解释：唯一可能的三元组和为 0
 */
var threeSum = function(nums) {
    let ans = [];
    let len = nums.length;
    if(len < 3) return ans; // 长度不够直接返回空数组
    nums.sort((a,b) => a-b); // 排序
    for(let i = 0; i < len; i++){
        if(nums[i] >0) break; // 当前项大于0，三数之和一定不等于0
        if(i > 0 && nums[i] === nums[i-1]) continue;
        let L = i+1;
        let R = len-1;
        while(L<R){
            let sum = nums[i] + nums[L] + nums[R];
            if(sum === 0){
                ans.push([nums[i], nums[L], nums[R]]);
                while(L<R && nums[L] === nums[L+1]) L++;
                while(L<R && nums[R] === nums[R-1]) R--;
                L++;
                R--;
            } else if(sum < 0){
                L++;
            } else if(sum > 0){
                R--;
            }
        }
    }
    return ans;
};

var threeSum  =function(nums) {
    let res = [];
    let len = nums.length;
    if(len < 3) return res;
    nums.sort((a,b) => a-b);
    for(let i = 0; i < len; i++){
        if(nums[i] > 0) break;
        if(i > 0 && nums[i] === nums[i-1])
    }
}

/**
 * -------------------------------------------四数之和-------------------------------------------
 * 给你一个由 n 个整数组成的数组 nums ，和一个目标值 target 。请你找出并返回满足下述全部条件且不重复的四元组 [nums[a], nums[b], nums[c], nums[d]] （若两个四元组元素一一对应，则认为两个四元组重复）：
 *
 * 0 <= a, b, c, d < n
 * a、b、c 和 d 互不相同
 * nums[a] + nums[b] + nums[c] + nums[d] == target
 * 你可以按 任意顺序 返回答案 。
 *
 * 示例 1：
 *
 * 输入：nums = [1,0,-1,0,-2,2], target = 0
 * 输出：[[-2,-1,1,2],[-2,0,0,2],[-1,0,0,1]]
 * 示例 2：
 *
 * 输入：nums = [2,2,2,2,2], target = 8
 * 输出：[[2,2,2,2]]
 */
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var fourSum = function(nums, target){
    let res = [];
    let len = nums.length;
    if(len < 4) return res;
    nums.sort((a,b) => a-b);
    for(let i = 0; i < len - 3; i++){
        // 当前数大于目标数，直接结束整个循环
        if(nums[i] > 0 && nums[i] > target) break;
        // 重复性跳过本次循环
        if(i > 0 && nums[i] === nums[i-1]) continue;
        for(let j = i+1; j < len - 2; j++){
            let x = nums[i] + nums[j];
            if( x > 0 && x > target) break;
            if( j > i+1 && nums[j] === nums[j-1]) continue;
            let l = j+1;
            let r = len-1;
            while (l < r) {
                let sum = nums[i] + nums[j] + nums[l] + nums[r];
                let ans = [nums[i], nums[j], nums[l], nums[r]];
                if(sum === target){
                    res.push(ans);
                    while(l < r && nums[l] === nums[l + 1]) l++;
                    while(l < r && nums[r] === nums[r - 1]) r--;
                    l++;
                    r--;
                } else if(sum < target){
                    l++;
                } else if(sum > target){
                    r--;
                }
            }
        }
    }
    return res;
}

/**
 * -------------------------------------------平衡二叉树-------------------------------------------
 * 满足平衡二叉树的条件：
 * 1.左右子树深度只差的绝对值不超过1；
 * 2.左右子树也是平衡二叉树；
 *
 * 输入：root = [3,9,20,null,null,15,7]
 * 输出：true
 *
 * 输入：root = [1,2,2,3,3,null,null,4,4] 输出：false
 *
 * 解题思路： 后序遍历 左右中 当前左子树和右子树高度只差大于1就返回-1
 */
var isBalanced = function (root) {
    // 1.确定入参以及返回值
    const getDepth = function (node) {
        // 2.设置中止条件
        if(node === null) return 0;
        // 3.后序遍历，左右子树判断平衡二叉树
        let leftDepth = getDepth(node.left);
        if(leftDepth === -1) return -1;
        let rightDepth = getDepth(node.right);
        if(rightDepth ===  -1) return -1;
        // 4.左右子树高度只差绝对值超过1，返回-1
        if(Math.abs(leftDepth - rightDepth) > 1){
            return -1;
        } else {
            return 1 + Math.max(leftDepth, rightDepth);
        }
    }
    return !(getDepth(root) === -1)
}


/**
 * -------------------------------------------对称二叉树-------------------------------------------
 * 请设计一个函数判断一棵二叉树是否 轴对称 。
 *
 * 实例1：
 * 输入：root = [6,7,7,8,9,9,8]
 * 输出：true
 *
 * 实例2：
 * 输入：root = [1,2,2,null,3,null,3]
 * 输出：false
 *
 * 实例3：
 * 输入：[6,7,7,8,null,8,null]
 * 输出：false
 *
 * 思路：对于二叉树是否对称，要比较的是根节点的左子树与右子树是不是相互翻转的，
 * 理解这一点就知道了其实我们要比较的是两个树（这两个树是根节点的左右子树），所以在递归遍历的过程中，也是要同时遍历两棵树。
 */
var checkSymmetricTree = function(root) {
    return check(root, root)
};
const check = (leftPtr, rightPtr) => {
    // 如果只有根节点，返回true
    if (!leftPtr && !rightPtr) return true
    // 如果左右节点只存在一个，则返回false
    if (!leftPtr || !rightPtr) return false
    return leftPtr.val === rightPtr.val && check(leftPtr.left, rightPtr.right) && check(leftPtr.right, rightPtr.left)
}

/**
 * -------------------------------------------计算二叉树的深度-------------------------------------------
 * 某公司架构以二叉树形式记录，请返回该公司的层级数。
 *
 * 示例 1：
 * 输入：root = [1, 2, 2, 3, null, null, 5, 4, null, null, 4]
 * 输出: 4
 * 解释: 上面示例中的二叉树的最大深度是 4，沿着路径 1 -> 2 -> 3 -> 4 或 1 -> 2 -> 5 -> 4 到达叶节点的最长路径上有 4 个节点。
 */
var calcDepth = function(root){
    if(root === null) return false;
    let left = calcDepth(root.left);
    let right = calcDepth(root.right);
    return 1+Math.max(left, right);
}

/**
 * -------------------------------------------二叉树的最小深度-------------------------------------------
 * 说明：最小深度是从根节点到最近叶子节点的最短路径上的节点数量。
 * 说明：叶子节点是指没有子节点的节点。
 *
 * 示例 1：
 * 输入：root = [3,9,20,null,null,15,7]
 * 输出：2
 *
 * 示例 2：
 * 输入：root = [2,null,3,null,4,null,5,null,6]
 * 输出：5
 *
 * 解题：只有当左右都为空的时候，才说明遍历的最低点了。如果其中一个为空则不是最低点，继续递归
 */
var minDepth = function (root) {
    // 根节点为null，深度为0
    if(!root) return 0;
    let left = minDepth(root.left);
    let right = minDepth(root.right);
    // 遍历非空子树
    if(root.left && !root.right) return 1+left;
    if(!root.left && root.right) return 1+right;
    return 1+Math.min(left, right);
}

/**
 * -------------------------------------------二叉树的最大深度-------------------------------------------
 * 二叉树的 最大深度 是指从根节点到最远叶子节点的最长路径上的节点数。
 * 示例 1：
 * 输入：root = [3,9,20,null,null,15,7]
 * 输出：3
 *
 * 示例 2：
 * 输入：root = [1,null,2]
 * 输出：2
 */
var maxDepth = function(root) {
    if(root === null) return 0;
    let leftMax = maxDepth(root.left);
    let rightMax = maxDepth(root.right);
    return 1 + Math.max(leftMax, rightMax)
}

/**
 * -------------------------------------------路径总和-------------------------------------------
 * 给你二叉树的根节点 root 和一个表示目标和的整数 targetSum 。判断该树中是否存在 根节点到叶子节点 的路径，这条路径上所有节点值相加等于目标和 targetSum 。如果存在，返回 true ；否则，返回 false 。
 *
 * 叶子节点 是指没有子节点的节点。
 *
 * 输入：root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22
 * 输出：true
 * 解释：等于目标和的根节点到叶节点路径如上图所示。
 *
 * 示例 2：
 * 输入：root = [1,2,3], targetSum = 5
 * 输出：false
 * 解释：树中存在两条根节点到叶子节点的路径：
 * (1 --> 2): 和为 3
 * (1 --> 3): 和为 4
 * 不存在 sum = 5 的根节点到叶子节点的路径。
 * 示例 3：
 *
 * 输入：root = [], targetSum = 0
 * 输出：false
 * 解释：由于树是空的，所以不存在根节点到叶子节点的路径。
 *
 */

var hasPathSum = function(root, targetSum){
    if(root === null) return false;
    // 每次递归都减去目标值
    targetSum -= root.val;
    // 左右子树相等
    if(root.left === root.right){
        return targetSum === 0;
    }
    return hasPathSum(root.left, targetSum) || hasPathSum(root.right, targetSum);
}

/**
 * -------------------------------------------二叉树的前序遍历-------------------------------------------
 * 给你二叉树的根节点 root ，返回它节点值的 前序 遍历。
 *  示例 1：
 * 输入：root = [1,null,2,3]
 * 输出：[1,2,3]
 *
 *  示例 2：
 * 输入：root = []
 * 输出：[]
 *
 *  示例 3：
 * 输入：root = [1]
 * 输出：[1]
 *
 *  示例 4：
 * 输入：root = [1,2]
 * 输出：[1,2]
 *
 *  示例 5：
 * 输入：root = [1,null,2]
 * 输出：[1,2]
 *
 *  提示：
 *  树中节点数目在范围 [0, 100] 内
 *  -100 <= Node.val <= 100
 *  进阶：递归算法很简单，你可以通过迭代算法完成吗？
 *
 * 解题思路：
 * 二叉树所谓的序可以理解为父节点的顺序，
 * 在第一就是前序，在中间就是中序，在最后就是后序；
 */
var preorderTraversal = function(root){
    let res = [];
    const dfs = function(root){
        if(root === null) return;
        //先序遍历所以从父节点开始
        res.push(root.val);
        // 递归左右子树
        dfs(root.left);
        dfs(root.right);
    }
    //只使用一个参数 使用闭包进行存储结果
    dfs(root);
    return res;
}

/**
 * -------------------------------------------二叉树的后序遍历-------------------------------------------
 * 给你一棵二叉树的根节点 root ，返回其节点值的 后序遍历 。
 *
 *  示例 1：
 * 输入：root = [1,null,2,3]
 * 输出：[3,2,1]
 *
 *  示例 2：
 * 输入：root = []
 * 输出：[]
 *
 *  示例 3：
 * 输入：root = [1]
 * 输出：[1]
 *
 *  提示：
 *  树中节点的数目在范围 [0, 100] 内
 *  -100 <= Node.val <= 100
 */
var postorderTraversal = function(root){
    let res = [];
    const dfs = function(root){
        if(root === null) return;
        dfs(root.left);
        dfs(root.right);
        res.push(root.val);
    }
    dfs(root);
    return res;
}

/**
 * -------------------------------------------翻转二叉树-------------------------------------------
 * 给定一棵二叉树的根节点 root，请左右翻转这棵二叉树，并返回其根节点。
 *
 * 示例1：
 * 输入：root = [4,2,7,1,3,6,9]
 * 输出：[4,7,2,9,6,3,1]
 *
 * 示例2：
 * 输入：root = [2,1,3]
 * 输出：[2,3,1]
 * 示例 3：
 *
 * 示例3：
 * 输入：root = []
 * 输出：[]
 *
 * 解题思路：二叉树的先序遍历:根左右，当前节点为空,返回null，交换左右子树
 *
 */
var mirrorTree = function(root) {
    if(root === null) return null;
    [[root.left], [root.right]] = [[root.right], [root.left]];
    mirrorTree(root.left);
    mirrorTree(root.right);
    return root;
};

/**
 * -------------------------------------------合并二叉树-------------------------------------------
 * 给你两棵二叉树： root1 和 root2 。
 * 想象一下，当你将其中一棵覆盖到另一棵之上时，两棵树上的一些节点将会重叠（而另一些不会）。你需要将这两棵树合并成一棵新二叉树。
 * 合并的规则是：如果两个节点重叠，那么将这两个节点的值相加作为合并后节点的新值；否则，不为 null 的节点将直接作为新二叉树的节点。
 * 返回合并后的二叉树。
 *
 * 注意: 合并过程必须从两个树的根节点开始。
 *
 * 示例 1：
 * 输入：root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]
 * 输出：[3,4,5,5,4,null,7]
 *
 * 输入：root1 = [1], root2 = [1,2]
 * 输出：[2,2]
 */
var mergeTrees = function(root1, root2) {
    // 返回有值的数
    if(root1 === null) return root2;
    if(root2 === null) return root1;
    // 合并节点
    root1.val += root2.val;
    // 遍历左右子节点
    root1.left = mergeTrees(root1.left, root2.left);
    root1.right = mergeTrees(root1.right, root2.right);
    return root1;
};

/**
 * -------------------------------------------二叉树的最近公共祖先-------------------------------------------
 * 给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。
 * 最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”
 * 例如，给定如下二叉树: root = [3,5,1,6,2,0,8,null,null,7,4]
 *
 * 示例 1:
 * 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1
 * 输出: 3
 * 解释: 节点 5 和节点 1 的最近公共祖先是节点 3。
 *
 * 示例 2:
 * 输入: root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4
 * 输出: 5
 * 解释: 节点 5 和节点 4 的最近公共祖先是节点 5。因为根据定义最近公共祖先节点可以为节点本身。
 *
 * 思路：lowestCommonAncestor(root, p, q)的功能是找出以root为根节点的两个节点p和q的最近公共祖先。 我们考虑：
 * 如果p和q分别是root的左右节点，那么root就是我们要找的最近公共祖先
 * 如果root是None，说明我们在这条寻址线路没有找到，我们返回None表示没找到
 * 我们继续在左右子树执行相同的逻辑。
 * 如果左子树没找到，说明在右子树，我们返回lowestCommonAncestor(root.right, p , q)
 * 如果右子树没找到，说明在左子树，我们返回lowestCommonAncestor(root.left, p , q)
 * 如果左子树和右子树分别找到一个，我们返回root
 */
var lowestCommonAncestor = function(root, p, q) {
    if(!root || root === p || root === q) return root;
    // 遍历左右子树
    const left = lowestCommonAncestor(root, p, q);
    const right = lowestCommonAncestor(root, p, q);
    // 查找有值的子树
    if(!left) return right;
    if(!right) return left;
    return root;
};

/**
 * -------------------------------------------二叉搜索树的最近公共祖先-------------------------------------------
 * 给定一个二叉搜索树, 找到该树中两个指定节点的最近公共祖先。
 * 最近公共祖先的定义为：“对于有根树 T 的两个结点 p、q，最近公共祖先表示为一个结点 x，满足 x 是 p、q 的祖先且 x 的深度尽可能大（一个节点也可以是它自己的祖先）。”
 * 例如，给定如下二叉搜索树: root = [6,2,8,0,4,7,9,null,null,3,5]
 * 示例 1:
 *
 * 输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8
 * 输出: 6
 * 解释: 节点 2 和节点 8 的最近公共祖先是 6。
 * 示例 2:
 *
 * 输入: root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4
 * 输出: 2
 * 解释: 节点 2 和节点 4 的最近公共祖先是 2, 因为根据定义最近公共祖先节点可以为节点本身。
 */
var lowestCommonAncestor = function(root, p, q) {
    // 没有根节点、更节点等于p或者q
    if(!root || root === p || root === q) return root;
    // 遍历左右子树
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    // 查找有值的子树
    if(!left) return right;
    if(!right) return left;
    return root;
};


/**
 * -------------------------------------------寻找二叉搜索树中的目标节点-------------------------------------------
 * 某公司组织架构以二叉搜索树形式记录，节点值为处于该职位的员工编号。请返回第 cnt 大的员工编号。
 *
 *  示例 1：
 * 输入：root = [7, 3, 9, 1, 5], cnt = 2
 *        7
 *       / \
 *      3   9
 *     / \
 *    1   5
 * 输出：7
 *
 *
 *  示例 2：
 * 输入: root = [10, 5, 15, 2, 7, null, 20, 1, null, 6, 8], cnt = 4
 *        10
 *       / \
 *      5   15
 *     / \    \
 *    2   7    20
 *   /   / \
 *  1   6   8
 * 输出: 8
 *
 *
 * 思路：
 * 其实这题和 230.二叉搜索树中的第 k 小的元素 有点像，就是一个求小一个求大
 * 首先必要知道的前提基础知识就是，二叉搜索树上的任意一个点，它的左子树上的所有点都比它本身小，右子树则大。
 * 那么中序遍历（中序遍历就是左中右）的结果，自然就是二叉树上结点的升序排序 —— 方便求第 k 小的数
 * 那反过来的中序遍历（右中左）自然就是二叉树的降序排序 —— 方便求第 k 大的数
 *
 */
var findTargetNode = function(root, cnt) {
    let res = [];
    if(root === null) return false;
    res.push(root.val);
    findTargetNode(root.left, cnt);
    findTargetNode(root.right, cnt);
    return res.sort((a, b) => b-a).filter((item, index) => { return index+1 == cnt; })
};



var kthLargest = function (root, k) {
    const stk = [];
    while (root !== null || stk.length) {
        while (root !== null) {
            stk.push(root); //存中
            root = root.right; //取右
        }
        root = stk.pop(); //取中
        if (--k === 0) break;
        root = root.left; //取左
    }
    return root.val;
};

/**
 * -------------------------------------------柯里化-------------------------------------------
 * @param fn
 * @param args
 * @returns {*}
 */
function curry(fn, ...args) {
    return fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args);
}


/**
 * -------------------------------------------深拷贝-------------------------------------------
 * @param object
 * @returns {*[]|{}}
 */
function deepClone(object){
    if(!object || typeof object !== 'object') return;
    let newObject = Array.isArray(object) ? [] : {};
    for(let key of object){
        if(object.hasOwnProperty(key)){
            newObject[key] = typeof object[key] === 'object' ? deepClone(object[key]) : object[key];
        }
    }
    return newObject;
}


/**
 * -------------------------------------------数字千位符用逗号隔开-------------------------------------------
 * @param number
 * @returns {string|string}
 */
function formatNumberWithCommas(number){
    // 数字转字符
    const numberString = String(number);
    // 检查是否有小数部分
    const [integer, decimal] = numberString.split('.');
    // 将整数部分没三位加一个逗号
    const integerWitchCommas = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // 如果有小数部分，则拼接整数部分和小数部分
    return decimal ? `${integerWitchCommas}.${decimal}` : integerWitchCommas;
}


// 示例
console.log(formatNumberWithCommas(123456789)); // 输出：123,456,789
console.log(formatNumberWithCommas(1234.5678)); // 输出：1,234.5678


/**
 * -------------------------------------------爬楼梯 climb Stairs-------------------------------------------
 *
 * 假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
 *
 *  示例 1：
 * 输入：n = 2
 * 输出：2
 * 解释：有两种方法可以爬到楼顶。
 * 1. 1 阶 + 1 阶
 * 2. 2 阶
 *
 * 示例 2：
 * 输入：n = 3
 * 输出：3
 * 解释：有三种方法可以爬到楼顶。
 * 1. 1 阶 + 1 阶 + 1 阶
 * 2. 1 阶 + 2 阶
 * 3. 2 阶 + 1 阶
 */
function climbStairs(n) {
    const  dp = [];
    dp[0] = 1;
    dp[1] = 1;
    for(let i = 2; i <= n; i++){
        dp[i] = dp[i-1] +dp[i-2];
    }
    return dp[n];
}

/**
 * -------------------------------------------最小花费爬楼梯-------------------------------------------
 * 数组的每个下标作为一个阶梯，第 i 个阶梯对应着一个非负数的体力花费值 cost[i]（下标从 0 开始）。
 *
 * 每当爬上一个阶梯都要花费对应的体力值，一旦支付了相应的体力值，就可以选择向上爬一个阶梯或者爬两个阶梯。
 *
 * 请找出达到楼层顶部的最低花费。在开始时，你可以选择从下标为 0 或 1 的元素作为初始阶梯。
 *
 *
 *
 * 示例 1：
 *
 * 输入：cost = [10, 15, 20]
 * 输出：15
 * 解释：最低花费是从 cost[1] 开始，然后走两步即可到阶梯顶，一共花费 15 。
 *  示例 2：
 *
 * 输入：cost = [1, 100, 1, 1, 1, 100, 1, 1, 100, 1]
 * 输出：6
 * 解释：最低花费方式是从 cost[0] 开始，逐个经过那些 1 ，跳过 cost[3] ，一共花费 6 。
 */
function spendClimbStairs(cost){
    let dp = [];
    let len = cost.length;
    dp[0] = cost[0];
    dp[1] = cost[1];
    for(let i = 2; i < len; i++){
        dp[i] = Math.min(dp[i-1], dp[i-2]) + cost[i];
    }
    return Math.min(dp[len-1], dp[len-2])
}


/**
 * -------------------------------------------优质数对的总数-------------------------------------------
 * 给你两个整数数组 nums1 和 nums2，长度分别为 n 和 m。同时给你一个正整数 k。
 * 如果 nums1[i] 可以被 nums2[j] * k 整除，则称数对 (i, j) 为 优质数对（0 <= i <= n - 1, 0 <= j <= m - 1）。
 * 返回 优质数对 的总数。
 *
 * 示例 1：
 * 输入：nums1 = [1,3,4], nums2 = [1,3,4], k = 1
 * 输出：5
 * 解释：
 * 5个优质数对分别是 (0, 0), (1, 0), (1, 1), (2, 0), 和 (2, 2)。
 *
 * 示例 2：
 * 输入：nums1 = [1,2,4,12], nums2 = [2,4], k = 3
 * 输出：2
 * 解释：
 * 2个优质数对分别是 (3, 0) 和 (3, 1)。
 *
 */
function numberOfPairs(nums1, nums2, k){
    // let len1 = nums1.length;
    // let len2 = nums2.length;
    // let res = [];
    // // let map = new Map();
    // for(let i = 0; i < len1; i++){
    //     for(let j = 0; j < len2; j++){
    //         let divisible = nums1[i] % (nums2[j] * k);
    //         console.log("divisible", divisible);
    //         if(divisible === 0){
    //             res.push({i, j});
    //         }
    //     }
    // }
    // console.log("res", res);
    // return res.length;

    const count = {};
    const count2 = {};
    let res = 0, max1 = 0;
    for (let num of nums1) {
        count[num] = (count[num] || 0) + 1;
        max1 = Math.max(max1, num);
    }
    for (let num of nums2) {
        count2[num] = (count2[num] || 0) + 1;
    }
    for (let a in count2) {
        let cnt = count2[a];
        for (let b = a * k; b <= max1; b += a * k) {
            if (b in count) {
                res += count[b] * cnt;
            }
        }
    }
    return res;
}

/**
 * -------------------------------------------多数元素-------------------------------------------
 * 给定一个大小为 n 的数组 nums ，返回其中的多数元素。多数元素是指在数组中出现次数 大于 ⌊ n/2 ⌋ 的元素。
 *
 * 示例 1：
 * 输入：nums = [3,2,3]
 * 输出：3
 *
 * 示例 2：
 * 输入：nums = [2,2,1,1,1,2,2]
 * 输出：2
 * */

// 暴力破解
var majorityElement = function(nums) {
    let len = nums.length;
    if(!len){ return len;}
    for(let i=0;i<len;i++){
        let count = 0;
        for(let j=i;j<len;j++){
            if(nums[i] === nums[j]){
                count++;
            }
        }
        if(count > len/2){
            return nums[i];
        }
    }
};

// 优化写法
const majorityElement = nums => {
    let count = 1;
    let majority = nums[0];
    for (let i = 1; i < nums.length; i++) {
        if (count === 0) {
            majority = nums[i];
        }
        if (nums[i] === majority) {
            count++;
        } else {
            count--;
        }
    }
    return majority;
};

const majorityElement = nums => {
    let len = nums.length;
    if(!len){ return len; }
    for(let i = 0; i < len; i++){
        let count = 0;
        for(let j = i; j < len; j++){
            if(nums[i] === nums[j]){
                count++;
            }
        }
        if(count > len/2){
            return num[i];
        }
    }
}

/**
 * -------------------------------------------快乐数-------------------------------------------
 * 编写一个算法来判断一个数 n 是不是快乐数。
 *
 * 「快乐数」 定义为：
 *  对于一个正整数，每一次将该数替换为它每个位置上的数字的平方和。
 *  然后重复这个过程直到这个数变为 1，也可能是 无限循环 但始终变不到 1。
 *  如果这个过程 结果为 1，那么这个数就是快乐数。
 *
 *
 *  如果 n 是 快乐数 就返回 true ；不是，则返回 false 。
 *
 * 示例 1：
 *  输入：n = 19
 *  输出：true
 *  解释：
 *  1² + 9² = 82
 *  8² + 2² = 68
 *  6² + 8² = 100
 *  1² + 0² + 0² = 1
 *
 *
 * 示例 2：
 *  输入：n = 2
 *  输出：false
 *
 **/

var isHappy = function(n) {
    if (n <= 4) {
        return n == 1;
    } else {
        console.log(n)
        let sum = 0;
        String(n).split('').map(item => {
            sum += Number(item) * Number(item);
        })
        return isHappy(sum);
    }
};

/**
 * -------------------------------------------面试真题-------------------------------------------
 * 输入： 3[a2[c]]   "3[a2[c[2d[e]]]]"
 * 输出: acc acc acc  acdedecdede acdedecdede acdedecdede
 * @param str
 */
const decodeString = (str) => {
    let strDecode = "";
    let strArr = String(str).split('').filter((fItem) => {
        return ![']', '['].includes(fItem);
    }).reverse();
    console.log("strArr", strArr); // ['c', '2', 'a', '3']
    (strArr||[]).map((item) => {
        if(/^\d+$/.test(item)){
            strDecode = Array(Number(item) + 1).join(strDecode);
        } else {
            strDecode = `${item}${strDecode}`;
        }
    })
    console.log("strDecode", strDecode);
    return strDecode;
}





