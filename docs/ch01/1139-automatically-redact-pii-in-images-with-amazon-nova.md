# Automatically redact PII in images with Amazon Nova

## Ch01.1139 Automatically redact PII in images with Amazon Nova

> 📊 Level ⭐⭐ | 2.2KB | `entities/automatically-redact-pii-in-images-with-amazon-nova.md`

# Automatically redact PII in images with Amazon Nova

Sharing data internally across teams, externally with partners, or using it for workloads such as machine learning (ML) model training is fundamental to modern business operations. However, when that data contains Personally Identifiable Information (PII), organizations face significant legal and compliance obligations under regulations such as the General Data Protection Regulation (GDPR) and the Payment Card Industry Data Security Standard (PCI DSS). If PII isn’t properly redacted before sharing or processing data, the result can be regulatory penalties, reputational damage, and erosion of customer trust.

PII redaction in real-world image datasets is particularly challenging. Unlike structured text, PII in images can appear in unexpected places and forms: a partial face captured at the edge of a frame, a face reflected on the polished surface of a car, a partially visible street sign that, combined with other visual cues, becomes identifiable, or a document lying on a desk in a wide-angle photo that reveals names, addresses, or ID numbers. These edge cases routinely defeat single-purpose masking tools.

[Amazon Nova](<https://aws.amazon.com/nova/models/?trk=33dc490e-0fb2-4cb1-a521-3941c13b64c0&sc_channel=ps>) is a family of foundation models with advanced vision understanding capabilities, making it a strong candidate to serve as the intelligent coordinator for complex image analysis workflows. Nova interprets image content holistically, reasons about whether something con

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/automatically-redact-pii-in-images-with-amazon-nova.md)

---

