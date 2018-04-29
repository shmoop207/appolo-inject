
Appolo Inject  
=======  
es6 [Dependency Injection](http://en.wikipedia.org/wiki/Dependency_injection) framework for nodejs build with typescript.  
`appolo-inject` is part for the [appolo](https://github.com/shmoop207/appolo) framework.  
  
## Installation  
```javascript  
npm install appolo-inject --save  
```  
## Typescript
`appolo-inject` requires TypeScript compiler version > 2.1 and the following settings in `tsconfig.json`:
```json
{
    "experimentalDecorators": true
}
```  

## Usage
 ### Creating injection container 
 ```javascript  
 var inject = require('appolo-inject');  
var injector = inject.createContainer();  

injector.addDefinitions({...});  
injector.initialize();  
```  
  
### Add Definitions 
the definition object key is used for object class id.  
```javascript  
var inject = require('appolo-inject');  
class FooController{ }  

var injector = inject.createContainer();  
injector.addDefinitions({  fooController: { type: FooController }});  
injector.initialize();   
```  
or with injector define  
```javascript  
let injector = inject.createContainer();  
injector.register('fooController',FooController);  
injector.initialize();  
  
//get fooController instance from the injector  
let fooController = injector.get('fooController');  
```  
  or with decorators  
```javascript
@define()
class FooController{ }   

//or with custom id
@define("someId")
class FooController2{ }

let injector = inject.createContainer();  
injector.register(FooController);  
injector.initialize();  
  
//get fooController instance from the injector  
let fooController = injector.get('fooController');//or
let fooController2 = injector.get(FooController); 
let someController = injector.get('someId');  
``` 
### Get Object  
get object from the injector by id or class name
if the object is not singleton you will get new instance every time.  
```javascript  
@define()
class FooController{ }  
  
let injector = inject.createContainer();  
 injector.register(FooController);
 injector.initialize();  

let fooController = injector.get<FooController>('fooController');  
let fooController2 = injector.get<FooController>('fooController');  
  
console.log(fooController === fooController2) // false  
  
```  
  
### Singleton  
the class will be created only once and `injector` will return the same instance every time.  
```javascript  
@define()
@singleton()
class FooController{}  
  
let injector = inject.createContainer();  
injector.register(FooController);
injector.initialize();  

let fooController = injector.get<FooController>(FooController);  
let fooController2 = injector.get<FooController>('fooController');  
  
console.log(fooController === fooController2) // true  
  
```  
### Inject Constructor Arguments  
you can inject objects to constructor arguments you can inject object instance by id or by value.  
it is not recommended to inject objects to constructor because you can easily get circular reference.   
   
```javascript  
@define()
@singleton()
class FooManager{  
    get name () { 
        return 'foo'
    }
} 
@define()
class BuzzController{  
	constructor (@injectParam() fooManager:FooManager,name:string) { 
	    this.fooManager = fooManager; 
	    this.name = name; 
	} 
	name () {
	    return   this.fooManager.name +this.name
	}
}  
  
var injector = inject.createContainer();  
injector.registerMulti([FooManager,BuzzController]); 
injector.initialize();  

var buzzController = injector.getObject<BuzzController>(BuzzController,["buzz"]);  
console.log(buzzController.name()) // foobuzz 
```  
### Inject with runtime arguments 
```javascript  
@define()
class BuzzController{  
	constructor(name:string) { 
	    this.name = name; 
	} 
	get name () {
	    return this.name
	}
}  

let injector = inject.createContainer();  
injector.register(BuzzController);
injector.initialize();

let buzzController = injector.get<BuzzController>('buzzController',['buzz']);  
console.log(buzzController.name) // buzz 
```  
### Init Method  
The `init method` will be called after all instances were created and all the properties injected.  
```javascript  
@define()
@singleton()
class FooManager{  
    get name(){return 'foo'; }
}  
@define()  
class FooController{  
    @inject() fooManager:FooManager
    @initMethod()
    initialize(){ this.name = this.fooManager.name } 
    get name () {return this.name}
}  
  
let injector = inject.createContainer();
injector.registerMulti([FooController,FooManager]); 
injector.initialize();

var fooController = injector.getObject('fooController');  
fooController.name // foo   
```    

### Inject  Instance  
`inject` will try to inject object id to the same property name.  
  
```javascript  
@define()
@singleton()
class FooManager{  
    get name () { return 'foo' }
}  
@define()
@singleton()  
class BarManager{  
    get name () { return 'bar' }
}  

@define() 
class BuzzController{ 
    @inject() fooManager:FooManager; 
    @inject() barManager:BarManager; 
	
    get name () { return this.fooManager.name + this.barManager.name }
}  
  
var injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager,BarManager]);  injector.initialize();  

var buzzController = injector.get<BuzzController>(BuzzController);  
console.log(buzzController.name) // foobar   
```  
  
### Inject Instance By Name  
you can set the name of the property the object will be injected to.  
```javascript  
@define()
@singleton()
class FooManager{  
    get name() {return 'foo'}
}  
@define()
@singleton()  
class BarManager{  
    get name() { return 'bar'}
}  
@deine()  
class BuzzController{
    @inject(FooManager) foo:FooManager; 
    @inject('barManager') bar:BarManager;  
	
    get name () { return this.foo.name + this.bar.name}
 }  
  
var injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager,BarManager]);  injector.initialize();
  
var buzzController = injector.get('buzzController');  
console.log(buzzController.name) // foobar ```  
```  
### Inject Property Value  
you can inject any value to object property.  
  
```javascript2
@define()  
class FooManager{
    @injectValue('foo') name:string
    get name () {return this.name;}
 }  
 
@define() 
class BuzzController{
    @inject(FooManager) foo:FooManager;
  
    get name () { return this.foo.name}
}  
  
let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager]);  injector.initialize();  

let buzzController = injector.get('buzzController');  
console.log(buzzController.name()) // foo   
```
### Inject Method Param
you can inject instance to method param.
```javascript
@define()  
class FooManager{
    get name () {return "foo"}
}  
 
@define() 
class BuzzController{ 
    public name (@injectParam(FooManager) foo:FooManager) { 
        return this.foo.name
    }
}

let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager]);  
injector.initialize();  

let buzzController = injector.get('buzzController');  
console.log(buzzController.name()) // foo   
  
```

### Inject  Factory   
factory object must have implement `get` method that will be called in order to inject the object instance.  
the `get` method can return promise;
```javascript  
@define()
@singleton()
class BarManager{  
    get name(){return 'bar'; }
}  

@define()
@singleton()
@factory()  
class Foo implements IFactory<BarManager>{
    @inject() barManager:BarManager;  
    async get ():Promise<BarManager> {
        return this.barManager;
    }
}
  
@define()  
class BuzzController{
    @inject() foo:BarManager  
    get name () {return this.foo.name}
 }  
  
let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager]); 
injector.initialize();

var buzzController = injector.getObject('buzzController');  
console.log(buzzController.name) // bar  
``` 

### Inject Factory Method  
factory method is a function that will return the injected object.  
this is useful the create many instances of the same class.  
```javascript  
@define()
class  Person{  
    constructor (name) { 
        this.name = name; 
    } 
    get name(){return this.name; }
}  
@define() 
class FooController{ 
    @injectFactoryMethod(Person) createPerson:(name)=>Person  
    name () { return this.createPerson('foo').name; }
}  
  
let injector = inject.createContainer();
injector.registerMulti([FooController,Person]); 
injector.initialize();
  
var buzzController = injector.getObject('fooController');  
console.log(fooController.name) // foo 
```  
### Alias  
you can add alias names to classes and get all the classes by single alias. all the alias must be singletons  
  
```javascript  
interface IHandler{
    name:string
}

@define()
@singleton()
@alias('IHandler')
class FooManager implements IHandler {  
    get name(){return 'foo'}
}  
@define()
@singleton()
@alias('IHandler') 
class BarManager implements IHandler{  
    get name(){return 'bar'}
}  

@define()  
class BuzzController{
    @injectAlias('handler') allHandlers:IHandler[]  
 
    get name(){      
        return this.allHandlers.map(obj =>obj.name).join(); 
    }
}  
  
let injector = inject.createContainer();
injector.registerMulti([BuzzController,BarManager,FooManager]); 
injector.initialize();

var buzzController = injector.getObject('buzzController');  
buzzController.name // foobar 
```  
  
### Alias Factory  
you can add alias factory names to classes and get all the classes new instance by factory method.  
```javascript  
interface IHandler{
    name:string
}

@define()
@aliasFactory('IHandler')
class FooManager implements IHandler{  
    constructor (private _name:string) {  } 
    get name():string{ return this._name }
}  
@define()
@aliasFactory('IHandler')  
class BarManager implements IHandler{  
    public name:string
    constructor (private _name:string) {  } 
    get name():string{ return this._name }
}  

@define() 
class BuzzController{  
    @injectAliasFactory('IHandler') allHandlers:((name:string)=>IHandler)[] 
	
    get name(){      
        return this.allHandlers.map((createHandler,index) =>createHandler(index).name).join(); 
    }  
  
let injector = inject.createContainer();
injector.registerMulti([BuzzController,BarManager,FooManager]); 
injector.initialize();

var buzzController = injector.getObject('buzzController');  
buzzController.name // 01 
```  
  
### Inject Property Array  
you can inject `array` of properties by `reference` or by `value`.  
  
```javascript  
@define()
@singleton() 
class FooManager{  
    get name () { return 'foo' }
 }  
  
@define()
@singleton() 
class BarManager{  
    get name () {return 'bar'}
}  
@define()  
class BuzzController{ 
    @injectArray([FooManager,BarManager]) objects:any[]
	
    name () { this.objects.map(obj=>obj.name).join() }
}  
  
let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager,BarManager]);  injector.initialize(); 

var buzzController = injector.getObject('buzzController');  
buzzController.name // foobar   

```  
  
### Inject Property Dictionary  
you can inject `dictionary` of properties by `reference` or by `value`.  
```javascript  
@define()
@singleton() 
class FooManager{  
	get name () { return 'foo' }
 }  
  
@define()
@singleton() 
class BarManager{  
	get name () {return 'bar'}
}  
@define() 
class BuzzController{
    @injectDictionary({foo:FooManager,bar:BarManager}) objects:any[]	  
    get name () {return this.objects.foo.name + this.objects.bar.name + this.objects.baz;}
}  
  
let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager,BarManager]);  injector.initialize();
 
var buzzController = injector.getObject('buzzController');  
buzzController.name // foobarbaz   
```  
  
### Inject Property From Object Property  
you can inject property from other object property.  
```javascript  
@define()
@singleton()
class FooManager{  
	public name =  'foo';
}  
@define()
class BuzzController{  
    @injectObjectProperty(FooManager,'name') otherObjectProperty	  
	
    name () {return return this.otherObjectProperty;}
}  
  
let injector = inject.createContainer(); 
injector.registerMulti([BuzzController,FooManager]);  injector.initialize();

let buzzController = injector.getObject('buzzController');  
buzzController.name() // foo  
```  

### Injector Aware  
you can get reference to the injector container by adding `injectorAware` the injector will be injected to `$injector` property. 
 
```javascript 
@define()
@injectorAware()
class FooController{
    @initMethod()
    initialize(){ this.$injector.getObject('foo') }
}  
```
  
## Tests  
```javascript  
grunt test
```  
  
## License
  
The `appolo inject` library is released under the MIT license. So feel free to modify and distribute it as you wish.  
