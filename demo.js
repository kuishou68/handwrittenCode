// 食亨
let list =[
    {id:1,name:'部门A',parentId:0},
    {id:2,name:'部门B',parentId:0},
    {id:3,name:'部门C',parentId:1},
    {id:4,name:'部门D',parentId:1},
    {id:5,name:'部门E',parentId:2},
    {id:6,name:'部门F',parentId:3},
    {id:7,name:'部门G',parentId:2},
    {id:8,name:'部门H',parentId:4}
];

let result = [
    {
        id: 1,
        name: '部门A',
        parentId: 0,
        children: [
            {
                id: 3,
                name: '部门C',
                parentId: 1,
                children: [
                    {
                        id: 6,
                        name: '部门F',
                        parentId: 3
                    }, {
                        id: 16,
                        name: '部门L',
                        parentId: 3
                    }
                ]
            },
            {
                id: 4,
                name: '部门D',
                parentId: 1,
                children: [
                    {
                        id: 8,
                        name: '部门H',
                        parentId: 4
                    }
                ]
            }
        ]
    }
];

var tree = function(list){
    let newList = [];
    for (let i = 0; i < list.length; i++) {
        if (list[i].parentId === 0) {
            newList.push({
                ...list[i],
                children: []
            })
        }
        if(newList && newList.length > 0){
            newList.forEach((item) => {
                if(item.id === list[i].parentId){
                    item.children.push(list[i])
                }
            })
        }
    }
    // console.log("newList", newList)
    return newList;
}
// debugger;
// console.log(tree(list))


// 基础类型 undefined、null、boolean、string、number、symbol、  栈，大小不固定、先进后出
// 引用类型 数组、对象、函数 堆、大小固定、相当于一个线性表

//


Function.prototype.MyRace = function(promises){
    return new Promise((resolve, reject) => {
        let len = promises.length;
        for(let i = 0; i< len; i++){
            Promise.resolve(promises[i]).then((data) => {
                resolve(data);
                return;
            }).catch((err) => {
                reject(err);
                return;
            })
        }
    })
}

// 二面
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(eventName, fn){
        if(!this.events[eventName]){
            this.events[eventName] = []
            return;
        }
        if(!fn){
            return;
        }
        this.events[eventName].push(fn)
    }
    emit(eventName, ...args){
        if(!this.events[eventName]){
            return;
        }
        this.events[eventName].forEach((item) => item(...args));
    }
    off(eventName, fn){
        if(!this.events[eventName]){
            this.events[eventName] = []
            return;
        }
        if(!fn){
            return;
        }
        this.events[eventName] = this.events[eventName].filter((item) => item !== fn);
    }
}

let a = new EventEmitter();
function aa(x) {
    console.log(x);
}
a.on("kak", aa)
a.on("kak", (data) => {
    console.log("1", data);
})
a.emit('kak', 'hahahah');
a.off('kak',aa);
a.emit('kak', 'hahahah');


// 样例输入：s = "3[a2[c[3d]]]"
// 样例输出：accaccacc

function test(str){
    // let rep = ''
    let match = str.match(/^(\d+)\[(\w+)\[(\w+)\]\]$/);
    // debugger;
    console.log(match)
    let res = [];
    if(match && match.length>0){
        for(let i = 1; i < match.length; i++){
            let obj = {};
            let splitArr = match[i].split('');
            obj = {
                item: match[i],
                // nums: typeof match[i].split('')[0] === 'number' ? match[i].split('')[0] : typeof match[i].split('')[1] === 'number' ? match[i].split('')[1],
                // str: match[i].split('')[1]
            }
            if(splitArr && splitArr.length > 1 ){
                obj.str = (/^\d+$/).test(splitArr[0]) ? splitArr[0] : 0;
                obj.nums = typeof splitArr[1] === 'string' ? splitArr[1] : "";
            }
            if(splitArr && splitArr.length === 1){
                obj.nums = typeof splitArr[0] === 'number' ? splitArr[0] : 0;
                obj.str = ""
            }
            res.push(obj);
        }
    }
    console.log(res);
    // debugger;
    if(res && res.length > 0){
        let newStr = "";
        for(let j = 0; j < res.length; j++){
            if(res[j].nums){
                newStr = `${res[j].str}`
                for(let k = 0; k < res[j].nums; k++){
                    newStr = `${newStr}`
                }
            }
        }
        console.log("newStr", newStr)
        debugger;
    }
}


console.log(test("3[a2[c]]"));






