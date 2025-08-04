package main

import (
	"github.com/gin-gonic/gin"                     // built on top of net/http
	_ "github.com/vky5/cloudsketch/core/generator" // since this is a package other depends on, it is called which registers the registrations info
	"github.com/vky5/cloudsketch/handlers"
)

func main() {
	r := gin.Default()

	r.GET("/ping", func(ctx *gin.Context) { // gin passes a context object which can be used to read request data (json, query params), write response objects and set headers and manage cookies
		ctx.JSON(200, gin.H{
			"message": "pong",
		})
	})

	r.POST("/generate", handlers.GenerateTerraform)

	r.Run(":8080")
}
