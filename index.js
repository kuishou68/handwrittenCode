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
 * 
 */


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
var twoSum = function(nums, target){
    let len = nums.length;
    let map = new Map();
    if(len < 2) return []
    for(let i=0; i<len; i++){
        let diff = target - nums[i];
        if(map.has(diff)){
            return [map.get(diff), i]
        }
        map.set(nums[diff], i)
    }
}

/**
 * -------------------------------------------三数之和-------------------------------------------
 * 
 */
var threeSum = function(nums) {
    let res = [];
    let len = nums.length;
    if(len < 3) return res;
    nums.sort((a,b) => a-b);
    for(let i = 0; i < len-2; i++){
        if(i > 0 && nums[i] === nums[i-1]) continue;
        let l = i+1;
        let r = len-1;
        while(l<r){
            let sum = nums[i] + nums[l] + nums[r];
            let ans = [nums[i], nums[l], nums[r]];
            if(sum === 0){
                res.push(ans);
                while(l<r && nums[l] === nums[l+1]) l++;
                while(l<r && nums[r] === nums[r-1]) r--;
                l++;
                r--;
            } else if(sum < 0){
                l++;
            } else if(sum > 0){
                r--;
            }
        }
    }
   
/**
 * -------------------------------------------四数之和-------------------------------------------
 * 
 */
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[][]}
 */
var  fourSum = function(nums, target){
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
            if(j > i+1 && nums[j] === nums[j-1]) continue;
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
 * 解题思路： 递归三部曲 后序遍历 左右中 当前左子树和右子树高度只差大于1就返回-1
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
 * -------------------------------------------二叉树的最小深度-------------------------------------------
 * 说明：最小深度是从根节点到最近叶子节点的最短路径上的节点数量。
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
 */