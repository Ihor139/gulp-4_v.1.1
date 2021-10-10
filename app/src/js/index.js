class ShowLog {
  constructor(message, age) {
    this.message = message
    this.age = age
  }
  sayHi() {
    console.log(this.message, this.age)
  }
}


const showLog = new ShowLog("Привет, мне", 24)

showLog.sayHi()