package main

import "github.com/gin-gonic/gin" // built on top of net/http

func main() {
	r := gin.Default()

	r.GET("/ping", func(ctx *gin.Context) { // gin passes a context object which can be used to read request data (json, query params), write response objects and set headers and manage cookies
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.Run(":8080")
}
