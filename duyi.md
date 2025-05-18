## HTML
### iframe
 - 可替换元素
   - 1.通常是行盒子
   - 2.通常显示的内容取决于元素的属性
   - 3.CSS不能完全控制其中的样式

-------------------------------------------------------------------

### CSS

【属性计算过程】确定声明值 ==> 层叠冲突 ==> 适用继承 ==> 适用默认值
#### 1. 确定声明值 
    - 参考样式表中没有冲突的声明，作为CSS属性值
    - 可以是作者样式表，也可以是浏览器默认样式表

#### 2. 层叠冲突
    - 对样式表中有冲突的声明使用层叠规则，确定css属性值
    - 比较重要性、特殊性、源次序

#### 3. 适用继承
    - 对仍然没有值的属性，若可以继承，则继承父元素的值

#### 4. 适用默认值
    - 对仍然没有值的属性，使用默认值

- 给a元素设置 没有下划线 颜色继承父元素?
  
````js
    a{
        text-decoration: none;
        color: inherit; 
    }
````
- `inherit` 手动继承 将父元素的值应用到该元素
- `initial` 初始值 将属性设置为默认值


【盒模型】：规定单个盒子的规则
【视觉可视化模型】：页面中的多个盒子排列规则
  - 常规流：
  - 浮动：
  - 定位：

#### 常规流布局
- 在常规流中，块盒在其包含块想要居中，可以定宽，然后左右margin设置为auto;


#### 浮动
- 高度坍塌
  - 原因：因为常规流盒子的自动高度，在计算时，不会考虑浮动盒子；
  - 解决：
    - 1.给最后一个元素设置 清除浮动 clear: both
    - 2.给伪元素设置浮动 ::after
#### 定位


【伪类选择器】
fist-child fist-of-type nth-child

#### @规则
@import "路径"
@chart "utf-8"


#### BFC (块级格式化上下文) 
- 全称 Block Formatting Context , 独立的渲染区域，由某个HTML元素创建，以下元素内部创建BFC区域:
  - 根元素 `<html></html>`
  - 浮动和绝对定位元素
  - overflow不等于visible的块盒
- 具体规则：内部的渲染不会影响到外部，
  - 创建BFC的元素，自动高度需要计算浮动元素
  - 创建BFC的元素，边框盒不会与浮动元素重叠
  - 创建BFC的元素，不会和他的子元素进行外边距合并

#### 布局
- 两栏布局
````html
<body>
    <div class="container clearfix">
        <aside class="aside">
            dadasdasda
        </aside>
        <div class="main">
            dasfasdf
        </div>
    </div>
</body>
<style>

    .aside{
        width: 300px;
        flot: left;
        background: red;
        color: #fff;
        marin-right: 10px;
    }
    .main{
        overflow: hidden; /** 一边区域定宽，设置overflow即可实现自适应 */
        background: gray;
    }
</style>
````

- 三栏布局
````html
<body>
    <div class="container clearfix">
        <aside class="left">
            dadasdasda
        </aside>
        <aside class="right">
            dadasdasda
        </aside>
        <div class="main">
            dasfasdf
        </div>
    </div>
</body>

<style>
    .container{
        padding: 30px;
        border: 3px solide 
    }
    /**  解决高度塌陷问题 */
    .clearfix::after{
        content: "",
        display: block;
        clear: both;
    }
    .left{
        width: 300px;
        flot: left;
        background: lightblue;
        color: #fff;
        marin-right: 10px;
    }
    .right{
        width: 300px;
        flot: right;
        background: lightblue;
        margin-left: 10px;
    }
    .main{
        overflow: hidden;
        background: gray;
    }
</style>

````


- 等高
  - 1.CSS3弹性盒
  - 2.js控制
  - 3.伪等高

- 行盒的垂直对其
- vertical-align

#### 堆叠上下文(stack context)
- 是一块区域，这块区域由某个元素创建，规定该区域中的内容在z轴上排列的先后顺序
- 创建堆叠上下文的元素
  - html元素（根元素）
  - 设置了z-index（非auto）的定位元素
- 堆叠顺序
  - 1.创建堆叠上下文元素的 `背景/边框`
  - 2.堆叠级别为负值的 `z-index: -1` z-index 值越大，越靠前
  - 3.常规流非定位块盒 `块级盒`
  - 4.非定位的 `浮动盒`
  - 5.常规流非定位 `行内盒`
  - 6.任何z-index是auto的定位子元素，以及z-index为0的堆叠上下文 `z-index: 0`
  - 7.堆叠级别为正值的堆叠上下文 `z-index: 1`

#### SVG (可缩放的矢量图)
- Scalable Vector Graphics 可以用来定义 XML 格式的矢量图形。
  - 矩形 rect 圆形 circle 椭圆 ellipse 线 line polyline polygon path
  

#### 居中总结
- 行盒水平居中：直接设置行盒父元素 `text-align: center`
- 常规流块盒水平居中：定宽，设置左右margin为auto `margin: 0 auto`
- 绝对定位元素水平居中：定宽，设置左右的坐标为0，将左右margin设置为auto `left: 50%; top: 50%; margin: 0 auto`
- 单行文本垂直居中：设置文本所在元素的行高，为整个区域的高度 `line-height: 100px`
- 行/块盒内多行文本的垂直文本：设置盒子上下文内边距相同 `padding: 20px`
- 绝对定位的垂直居中：定高，设置上下坐标为0，将上下margin设置为auto `top:0; bottom:0; margin: auto 0`

-------------------------------------------------------------------
## JS

### 正则表达式
- `reg.test()` 测试字符串有没有符合要求的片段，返回true或者false
- `str.match()` 方法是一个在字符串中执行查找匹配的String方法，它返回一个数组，在未匹配到时会返回 null。
- `reg.exec()` 

- `\w` === [0-9A-Za-z], `\W` === [^\w] 字母
- `\d` === [0-9], `\D` === [^\d] 数字
- `\s` === `\n`换行符 + `\f`换页符 + `\r`回车符 + `\t`制表符 + `\v`垂直制表符  空白字符, `\S` === `[^s]` 
- `\b` 单词边界， "abc dev sfe" dev两边的边界，`\B` === [^\b]

量词
````js
const reg = /\w*/g
const str = "aaaaaaaaaa"
````

- `n+` 匹配任何包含至少一个n的字符集 
- `n*` 匹配任何包含0个或多个n的字符集
- `n?` 匹配任何包含0个或一个n的字符集
- `n{X}` 匹配包含X个n的系列的字符 
- `n{X, Y}` 匹配包含X至Y序列的字符串  `/\w{3,5/g` 
- `n{X, }` 匹配包含至少X个n序列的字符串
- `n$` 匹配任何结尾为n的字符串
- `^n` 匹配任何开始为n的字符串
- `?=n` 匹配任何其后紧接指定字符串n的字符串 `正先行断言`
- `?!n` 匹配任何其后没有紧接指定字符串n的字符串  `负先行断言`
- `?<=` 匹配 其前跟随着断言中定义的格式。 `正后发断言` 例如，表达式 (?<=(T|t)he\s)(fat|mat) 匹配 fat 和 mat，且其前跟着 The 或 the。
- `?<!` 匹配 其前不跟随着断言中定义的格式。`负后发断言` 例如，表达式 (?<!(T|t)he\s)(cat) 匹配 cat，且其前不跟着 The 或 the。


参考：https://www.cnblogs.com/ranxi169/p/16556257.html

````js
// 输入：the-first-name 输出：theFirstName
const reg = /-(\w)/g;
const str = "the-first-name";
str.replace(reg, function($, $1){
    return $1.toUpperCase();
})

/**
 * 例如：abaaaa 
 * 正向预查 匹配 b前面的a；
 * 正向断言 匹配 b后面的aaaa
 */
// 正向预查 匹配 b前面的a；
const reg = /a(?=b)/g;
const str = "abaaaa";
str.match(reg); // ['a']
// 正向断言 匹配b后面的aaaa
const reg = /a(?!b)/g;
const str = "abaaaa";
str.match(reg); // ['a', 'a', 'a', 'a']


/**
 * 字符串去重
 * 输入：aaaaaaaabbbbbbbbccccccc
 * 输出：abc
 * 
 */
const str = "aaaaaaaabbbbbbbbccccccc";
const reg = /(\w)\1*/g;
console.log(str.replace(reg, "$1")); // abc


/**
 * 获取所有包含 . 并且前面是 $ 的数字
 * 希望从下面的输入字符串 $4.44 和 $10.88 中获得所有以 $ 字符开头的数字
 */
const reg = /(?<=\$)[0-9\.]*/g;
const str = "$10.88";
str.match(reg); //

````
### 对象
- 属性描述符
````js
const user = {
    name: 'monica',
  age: 17
}
// 获取属性描述符
const des = Object.getOwnPropertyDescriptor(user, 'name')
console.log(des);

// 输出：
// {
//   "value": "monica",
//   "writable": true,
//   "enumerable": true, // 可枚举
//   "configurable": true
// }

// 修改属性描述符
Object.defineProperty(user, 'name', {
   "value": "张三",
  "writable": true,
  "enumerable": true,
  "configurable": true
})

// 赋值obj除a以外所有的属性到一个新的对象
const obj = {
    a: 1,
    b: 2,
    c: 3
}

const { a, ...newObj } = obj;
console.log(newObj);
````

### 函数
````js
const getData = ({page=1, limit=10, keyword=''}={}) => {
  console.log(`${page}-${limit}-${keyword}`);
}
getData()
getData({
  page: 2
})
getData({
  page: 2,
  limit: 30
})
getData({
  keyword: 'js'
})
````

### 事件循环
