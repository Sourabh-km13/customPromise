class CustomPromise {
  constructor(task) {
    this.state = "pending"
    this.value = null
    this.fullfillcallbacks = []
    this.rejectcallbacks = []
    const resolve = (val) => {
      if (this.state === "pending") {
        this.state = "fullfilled"
        this.value = val
        this.fullfillcallbacks.forEach((element) => {
          element(this.value)
        })
      }
    }
    const reject = (val) => {
      if (this.state === "pending") {
        this.state = "rejected"
        this.value = val
        this.rejectcallbacks.forEach((element) => {
          element(this.value)
        })
      }
    }
    try {
      task(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }
  then(onfullfill, onreject) {
    return new CustomPromise((res, rej) => {
      if (this.state === "fullfilled") {
        try {
          const prevfullfilled = onfullfill
            ? onfullfill(this.value)
            : this.value
          res(prevfullfilled)
        } catch (error) {
          rej(error)
        }
      } else if (this.state === "rejected") {
        if (onreject) {
          try {
            const prevrejected = onreject(this.value)
            res(prevrejected)
          } catch (error) {
            rej(error)
          }
        } else {
          rej(this.value)
        }
      }
      if (this.state === "pending") {
        this.fullfillcallbacks.push(() => {
          try {
            const prevfullfilled = onfullfill(this.value)
            res(prevfullfilled)
          } catch (error) {
            rej(error)
          }
        })
        this.rejectcallbacks.push(() => {
          try {
            if (onreject) {
              const result = onreject(this.value)
              res(result)
            } else {
              rej(this.value) // Propagate rejection
            }
          } catch (error) {
            rej(error)
          }
        })
      }
    })
  }
  catch(onreject) {
    return this.then(null, onreject)
  }
}

const p = new CustomPromise((res, rej) => {
  rej("hello")
})
p.then(
  (res) => {
    console.log("resolved", res)
    return 10
  },
  (res) => {
    console.log("catched", res)
  }
).then(() => {
  console.log("chaining")
})
