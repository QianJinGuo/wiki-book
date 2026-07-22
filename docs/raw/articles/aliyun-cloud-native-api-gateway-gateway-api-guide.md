---
source_url: "https://mp.weixin.qq.com/s/t1lZeXhRCbZ-3JJXP30w6g"
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-23
sha256: ""
---

apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: httpbin-route
  namespace: default
spec:
  parentRefs:
    - name: apig-gateway
  hostnames:
    - "demo.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - kind: Service
          name: httpbin
          port: 80
```

## 参考链接
- [通过云原生 API 网关使用 Gateway API 暴露服务](https://help.aliyun.com/zh/api-gateway/cloud-native-api-gateway/use-cases/expose-services-by-using-the-gateway-api-through-the-cloud-native-api)
