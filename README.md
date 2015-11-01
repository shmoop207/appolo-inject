Appolo Inject
=======
es6 [Dependency Injection][1] framework for nodejs.

## Installation
```javascript
npm install appolo-inject --save
```

## Usage 
### Creating injection container 
```javascript
 var inject = require('appolo-inject');
 
 var injector = inject.createContainer();

injector.addDefinitions({...});

injector.initialize();

```

### Add Definitions to injector 
the definition object key is used for object class id.
```javascript
var inject = require('appolo-inject');
 
 class FooController{
    constructor () {
    }
}
 
var injector = inject.createContainer();
injector.addDefinitions({
    fooController: {
        type: FooController
    }
});
injector.initialize();

//or
var injector = inject.createContainer()
    .define('fooController',FooController)
    .initialize();

//get fooController instance from the injector
var fooController = injector.get('fooController');
```

### Get Object
get object from the injector if the object is not singleton you will get new instance every time.
```javascript
class FooController{
    constructor () {
    } 
}

var injector = inject.createContainer()
    .define('fooController',FooController)
    .initialize();

var fooController = injector.get('fooController');
var fooController2 = injector.get('fooController');

console.log(fooController === fooController2) // false

```

### Singleton
the class will be created only once and `injector` will return the same instance every time.
```javascript
class FooController{
    constructor () {
    }
}

var injector = inject.createContainer()
    .define('fooController',FooController).singleton()
    .initialize();

var fooController = injector.get('fooController');
var fooController2 = injector.get('fooController');

console.log(fooController === fooController2) // true

```
### Inject Constructor Arguments
you can inject objects to constructor arguments you can inject object instance by id or by value.
it is not recommended to inject objects to constructor because you can easily get circular reference.
if the constructor arg name exist in injector definition it will be injected automatically 

```javascript
class FooManager{
    get name () {return 'foo'}
}

class BuzzController{
     constructor (fooManager) {
        this.fooManager = fooManager;
    }
    get name () {
        return this.fooManager.name
    }
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .define('fooManager',FooManager).singleton()
    .initialize();

 var buzzController = injector.get('buzzController');
 console.log(buzzController.name()) // foo 
```

or you can define the constructor manually

```javascript
class FooManager{
    get name () { return 'foo'}
}

class BuzzController{
     constructor (fooManager,name) {
        this.fooManager = fooManager;
        this.name = name;
    }
    name () {return this.name + this.foo.name}
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .args({ref:'fooManager'}).args({value:'buzz'})
    .define('fooManager',FooManager).singleton()
    .initialize();

var buzzController = injector.getObject('buzzController');
console.log(buzzController.name()) // buzzfoo 
```

you can also pass runtime arguments to `get` function

```javascript
class FooManager{
    get name () { return 'foo'}
}

class {
     constructor: function (fooManager,name2) {
        this.fooManager = fooManager;
        this.name = name;
    }
    get name () {return this.name + this.fooManager}
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .define('fooManager',FooManager).singleton()
    .initialize();
    
var buzzController = injector.get('buzzController',['buzz']);
console.log(buzzController.name) // buzzfoo 
```

### Inject Property Instance
`inject` will try to inject object id to the same property name.

```javascript
class FooManager{
    get name () { return 'foo' }
}

class BarManager{
    get name () { return 'bar' }
}

class BuzzController{
    get name () { return this.fooManager.name + this.barManager.name }
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController).inject(['fooManager','barManager'])
    .define('fooManager',FooManager).singleton()
    .define('barManager',BarManager).singleton()
    .initialize();

var buzzController = injector.get('buzzController');
console.log(buzzController.name) // foobar 

```

### Inject Property Reference By Name
you can set the name of the property the object will be injected to.
```javascript
class FooManager{
    get name() {return 'foo'}
}

class BarManager{
    get name() { return 'bar'}
}

class BuzzController
    get name () { return this.foo.name + this.bar.name}
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .inject('foo','fooManager').inject({name:'bar',ref:'barManager'})
    .define('fooManager',FooManager).singleton()
    .define('barManager',BarManager).singleton()
    .initialize();

var buzzController = injector.get('buzzController');
console.log(buzzController.name) // foobar 
```

### Inject Property Value
you can inject any value to object property.

```javascript
class FooManager{
    get name () {return this.name;}
}

class BuzzController{
    get name () { return this.foo.name}
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController).inject('foo','fooManager')
    .define('fooManager',FooManager).singleton().inject({name:'name',value:'foo'})
    .initialize();

var buzzController = injector.get('buzzController');
console.log(buzzController.name()) // foo 

```

### Inject Property Array
you can inject `array` of properties by `reference` or by `value`.

```javascript
class FooManager{
    get name () { return 'foo' }
}

class BarManager{
    get name () {return 'bar'}
}

class BuzzController{
    name () {
        this.objects.forEach(obj=>console.log(obj.getName))
    }
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .injectArray('objects',[{ref:'fooManager'},{ref:'barManager'}])
    .define('fooManager',FooManager).singleton()
    .define('barManager',BarManager).singleton()
    .initialize();

var buzzController = injector.getObject('buzzController');
buzzController.name() // foo bar 

```

### Inject Property Dictionary
you can inject `dictionary` of properties by `reference` or by `value`.
```javascript
class FooManager{
    get name () {return 'foo'}
}

class BarManager{
    get name() {return 'bar'}
}

class BuzzController{
    get name () {return this.objects.foo.name + this.objects.bar.name + this.objects.baz;}
}

var injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .injectDictionary('objects',[{key:'foo',ref: 'fooManager'},{key:'bar',ref: 'barManager'},{key:'baz',value: 'baz'}])
    .define('fooManager',FooManager).singleton()
    .define('barManager',BarManager).singleton()
    .initialize();

var buzzController = injector.getObject('buzzController');
buzzController.name // foobarbaz 

```

### Inject Property From Object Property
you can inject property from other object property.
```javascript
class FooManager{
    constructor () {
        this.name = 'foo';
    }
}

class BuzzController{
    name () {return return this.otherObjectProperty;}
}

injector = inject.createContainer()
    .define('buzzController',BuzzController)
    .injectObjectProperty('otherObjectProperty','fooManager','name')
    .define('fooManager',FooManager).singleton()
    .initialize();

var buzzController = injector.getObject('buzzController');
buzzController.name() // foo
```

### Inject Property From Factory Object
factory object must have implement `get` method witch will be called in order to inject the object instance.
the factory must implement the get method
```javascript
class BarManager{
    get name(){return 'bar'; }
}

class FooFactory{
    get () {return this.barManager;}
}

class BuzzController{
    get name () {return this.manager.name();}
}

injector = inject.createContainer()
    .define('barManager',BarManager).singleton()
    .define('fooFactory',FooFactory).singleton().inject('barManager')
    .define('buzzController',BuzzController).injectFactory('manager','fooFactory')
    .initialize();

var buzzController = injector.getObject('buzzController');
console.log(buzzController.name) // bar 
```

this will also work if you try to inject object with `Factory` Suffix 

```javascript
class BarManager{
    get name(){return 'bar'; }
}

class ManagerFactory{
    get () {return this.barManager;}
}

class BuzzController{
    get name () {return this.manager.name();}
}

injector = inject.createContainer()
    .define('barManager',BarManager).singleton()
    .define('managerFactory',ManagerFactory).singleton().inject('barManager')
    .define('buzzController',BuzzController).inject('manager')
    .initialize();

var buzzController = injector.getObject('buzzController');
console.log(buzzController.name) // bar 
```

### Inject Factory Method
factory method is a function that will return the injected object.
this is useful the create many instances of the same class.
```javascript
class  Person{
    constructor (name) {
        this.name = name;
    }
    get name(){return this.name; }
}

class FooController{
    name () {
        return this.createPerson('foo').name;
    }
}

injector = inject.createContainer()
	.define('person',Person)
	.injectFactoryMethod('createPerson','person')
    .initialize();
    
var buzzController = injector.getObject('buzzController');
buzzController.name() // foo 
```

### Init Method
The `init method` will be called after all instances were created and all the properties injected.
```javascript
class FooManager{
    get name(){return 'foo'; }
}

class FooController{
    initialize(){
        this.name = this.fooManager.name
    }
    get name () {return this.name}
}

injector = inject.createContainer()
    .define('fooManager',FooManager)
    .define('fooController',FooController).inject('fooManager')
    .initMethod('initialize')
    .initialize();

var fooController = injector.getObject('fooController');
fooController.name() // foo 

```
### Injector Aware
you can get reference to the injector container by adding `injectorAware` the injector will be injected to `$injector` property.

```javascript
class FooController{
    initialize(){
        this.$injector.getObject('foo')
    }
}

injector = inject.createContainer()
    .define('fooController',FooController).injectorAware()
    .initialize();
```

### Alias
you can add alias names to classes and get all the classes by single alias. all the alias must be singletons

```javascript
class FooManager{
    get name(){return 'foo'}
}

class BarManager{
    get name(){return 'bar'}
}

class BuzzController{
	name(){ 
		this.allHandlers.forEach(obj =>{
			console.log(obj.name()));
		}
	}
}

injector = inject.createContainer()
    .define('buzzController',BuzzController).singleton()
    .injectAlias('allHandlers','handler')
    .define('barManager',BarManager).singleton().alias('handler')
    .define('fooManager',FooManager).singleton().alias('handler')
    .initialize();

var buzzController = injector.getObject('buzzController');
buzzController.name() // foobar 
```

### Alias Factory
you can add alias factory names to classes and get all the classes new instance by factory method.

```javascript
class FooManager{
    constructor (name) {
        this.name = name;
    }
    get name(){return this.name}
}

class BarManager{
    constructor (name) {
        this.name = name;
    }
    get name(){return this.name}
}

class BuzzController{
    name(){ 
	    this.allHandlers.forEach((factory,index) =>{
		    console.log(factory(index).name))
	    }
    }
}

injector = inject.createContainer()
	.define('buzzController',BuzzController).singleton()
	.injectAlias('allHandlers','handler')
    .define('barManager',BarManager).alias('handler')
    .define('fooManager',FooManager).alias('handler')
    .initialize();

var buzzController = injector.getObject('buzzController');
buzzController.name() // 01 
```


## Tests ##
```javascript
    grunt test
```

## License ##

The `appolo inject` library is released under the MIT license. So feel free to modify and distribute it as you wish.


  [1]: http://en.wikipedia.org/wiki/Dependency_injection
