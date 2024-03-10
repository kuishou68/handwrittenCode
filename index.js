// 防抖
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

// 节流
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

// 发布订阅模式
// class EventEmiter {
//     constructor() {
//       // 事件对象，存放订阅的名字和事件
//       this._events = {}
//     }
//     // 订阅事件的方法
//     on(eventName,callback) {
//       if(!this._events) {
//         this._events = {}
//       }
//       // 合并之前订阅的cb
//       this._events[eventName] = [...(this._events[eventName] || []),callback]
//     }
//     // 触发事件的方法
//     emit(eventName, ...args) {
//       if(!this._events[eventName]) {
//         return
//       }
//       // 遍历执行所有订阅的事件
//       this._events[eventName].forEach(fn=>fn(...args))
//     }
//     off(eventName,cb) {
//       if(!this._events[eventName]) {
//         return
//       }
//       // 删除订阅的事件
//       this._events[eventName] = this._events[eventName].filter(fn=>fn != cb && fn.l != cb)
//     }
//     // 绑定一次 触发后将绑定的移除掉 再次触发掉
//     once(eventName,callback) {
//       const one = (...args)=>{
//         // 等callback执行完毕在删除
//         callback(args)
//         this.off(eventName,one)
//       }
//       one.l = callback // 自定义属性
//       this.on(eventName,one)
//     }
//   }

// let event = new EventEmiter()

// let login1 = function(...args) {
//   console.log('login success1', args)
// }
// let login2 = function(...args) {
//   console.log('login success2', args)
// }
// event.on('login',login1)
// event.once('login',login2)
// event.off('login',login1) // 解除订阅
// event.emit('login', 1,2,3,4,5)
// event.emit('login', 6,7,8,9)
// event.emit('login', 10,11,12)


// 简易写法
// class EventEmiter {
//     constructor(){
//         this.message = {};
//     }
//     on(type, fn){
//         if(!this.message[type]){
//             this.message[type] = [];
//         }
//         this.message[type].push(fn);
//     }
//     off(type, fn){
//         if(!this.message[type]){
//             return;
//         }
//         if(!fn){
//             this.message[type] = undefined;
//             return;
//         }
//         this.message[type] = this.message[type].filter((item) =>  item !== fn )
//     }
//     emit(type){
//         // 没有订阅直接return
//         if(this.message[type]){
//             return;
//         }
//         this.message[type].forEach((item) => {
//             item();
//         })
//     }
// }

class EventEmiter{
    consructor(){
        this.events = {};
    }
    // 订阅事件
    on(eventName, fn){
        // 没有该事件，赋予初始值
        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        // 有则push到数组中
        this.events[eventName].push(fn);
    }
    // 取消订阅
    off(eventName, fn){
        // 如果没有订阅，直接return
        if(!this.events[eventName]){
            return;
        }
        // 如果没有该函数，删掉整个事件
        if(!fn){
            this.events[evensName] = undefined;
            return;
        }
        // 过滤fn
        this.events[eventName] = this.events[eventName].filter(item => item !== fn);
    }
    // 发布
    emit(eventName){
        // 没有直接return
        if(!this.events[eventName]){
            return;
        }
        this.events[eventName].forEach((item) => {
            item();
        })
    }
}



// const eventEmitter = new EventEmiter();
// const event1Listener = (a, b) => {
//     console.log(`event1：a=${a}, b=${b}`);
// }

// const event2Listener = () => {
//     console.log("event2");
// }

// const event3Listener = () => {
//     console.log("event3");
// }

// eventEmitter.on('event1', event1Listener);
// eventEmitter.on('event2', event2Listener);

// console.log(eventEmitter);

// eventEmitter.emit('event1', 1, 2); // 输出 ”event1: a=1, b=2
// eventEmitter.emit('event2'); // 输出 ”event2

// eventEmitter.on('event2', event3Listener);
// eventEmitter.emit('event2'); // 输出 ”event2 和 event3

// eventEmitter.off('event1', event1Listener);
// eventEmitter.emit('event1'); // 不输出任何内容

