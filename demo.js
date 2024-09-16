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
            [arr[i], arr[j]] = [arr[j], arr[i]];
            i++;
            j--;
        }
    }
    return i;
}
// debugger;
console.log(quickSort([5, 1, 3, 6, 2, 0, 7]))
