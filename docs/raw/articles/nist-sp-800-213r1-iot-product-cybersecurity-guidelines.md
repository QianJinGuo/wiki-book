sha256: d4b4f8c50df9daddc550ef3ebdf5238a913f202a4be8d9ab009efc77994cc2bf
---
title: "NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines for the Federal Government"
source_url: "https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-213r1.ipd.pdf"
author: "Michael Fagan, Katerina N. Megas, Jeffrey Marron, Kevin G. Brady Jr., Barbara B. Cuthill"
created: 2026-06-28
ingested: 2026-06-28
type: article
tags: [nist, iot, cybersecurity, federal, standards, sp-800-213]
---

# NIST SP 800-213r1 — IoT Product Cybersecurity Guidelines for the Federal Government


Published Time: Tue, 23 Jun 2026 17:51:41 GMT

Number of Pages: 60

Markdown Content:
NIST Special Publication 800 

# NIST SP 800-213r1 ipd 

# IoT Product Cybersecurity Guidelines for the Federal Government 

# Establishing IoT Product Cybersecurity Requirements 

# Initial Public Draft 

## Michael Fagan 

## Katerina N. Megas 

## Jeffrey Marron 

## Kevin G. Brady, Jr. 

## Barbara B. Cuthill 

This publication is available free of charge from: 

https://doi.org/10.6028/NIST.SP.800-213r1.ipd NIST Special Publication 800 

# NIST SP 800-213r1 ipd 

# IoT Product Cybersecurity Guidelines for the Federal Government 

# Establishing IoT Product Cybersecurity Requirements 

# Initial Public Draft 

## Michael Fagan 

## Katerina Megas 

## Jeffrey Marron 

## Kevin G. Brady, Jr. 

## Barbara B. Cuthill 

Applied Cybersecurity Division 

Information Technology Laboratory 

This publication is available free of charge from: 

https://doi.org/10.6028/NIST.SP.800-213r1.ipd 

June 2026 

U.S. Department of Commerce 

Howard Lutnick, Secretary 

National Institute of Standards and Technology 

Arvind Raman, NIST Director and Under Secretary of Commerce for Standards and Technology NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

Certain equipment, instruments, software, or materials, commercial or non-commercial, are identified in this paper in order to specify the experimental procedure adequately. Such identification does not imply recommendation or endorsement of any product or service by NIST, nor does it imply that the materials or equipment identified are necessarily the best available for the purpose. 

There may be references in this publication to other publications currently under development by NIST in accordance with its assigned statutory responsibilities. The information in this publication, including concepts and methodologies, may be used by federal agencies even before the completion of such companion publications. Thus, until each publication is completed, current requirements, guidelines, and procedures, where they exist, remain operative. For planning and transition purposes, federal agencies may wish to closely follow the development of these new publications by NIST. 

Organizations are encouraged to review all draft publications during public comment periods and provide feedback to NIST. Many NIST cybersecurity publications, other than the ones noted above, are available at 

https://csrc.nist.gov/publications .

Authority 

This publication has been developed by NIST in accordance with its statutory responsibilities under the Federal Information Security Modernization Act (FISMA) of 2014, 44 U.S.C. § 3551 et seq., Public Law (P.L.) 113-283. NIST is responsible for developing information security standards and guidelines, including minimum requirements for federal information systems, but such standards and guidelines shall not apply to national security systems without the express approval of appropriate federal officials exercising policy authority over such systems. This guideline is consistent with the requirements of the Office of Management and Budget (OMB) Circular A-130. 

Nothing in this publication should be taken to contradict the standards and guidelines made mandatory and binding on federal agencies by the Secretary of Commerce under statutory authority. Nor should these guidelines be interpreted as altering or superseding the existing authorities of the Secretary of Commerce, Director of the OMB, or any other federal official. This publication may be used by nongovernmental organizations on a voluntary basis and is not subject to copyright in the United States. Attribution would, however, be appreciated by NIST. 

NIST Technical Series Policies 

Copyright, Use, and Licensing Statements 

NIST Technical Series Publication Identifier Syntax 

Publication History 

Approved by the NIST Editorial Review Board on YYYY-MM-DD [Will be added to final publication.] Supersedes NIST Series XXX (Month Year) DOI [Will be added to final publication.] 

How to Cite this NIST Technical Series Publication 

Fagan M, Megas K, Marron J, Brady K, Cuthill B (2026) IoT Product Cybersecurity Guidelines for the Federal Government: Establishing IoT Product Cybersecurity Requirements. (National Institute of Standards and Technology, Gaithersburg, MD), NIST Special Publication (SP) NIST SP 800-213r1 ipd. https://doi.org/10.6028/NIST.SP.800-213r1.ipd 

Author ORCID iDs 

Michael Fagan: 0000-0002-1861-2609 

Katerina N. Megas: 0000-0002-2815-5448 

Barbara Cuthill: 0000-0002-2588-6165 

Jeffrey Marron: 0000-0002-7871-683X NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

Public Comment Period 

June 24 – August 24, 2026 

Submit Comments 

iotsec@nist.gov 

National Institute of Standards and Technology 

Attn: Applied Cybersecurity Division, Information Technology Laboratory 

100 Bureau Drive (Mail Stop 2000) Gaithersburg, MD 20899-2000 

Additional Information 

Additional information about this publication is available at  https://csrc.nist.gov/pubs/sp/800/213/r1/ipd ,

including related content, potential updates, and document history. 

All comments are subject to release under the Freedom of Information Act (FOIA). NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> i

Abstract 

Organizations increasingly use Internet of Things (IoT) products for the mission benefits they can offer, but care must be taken in the acquisition and implementation of this equipment. Understanding that an IoT product is a system element facilitates an understanding of how the IoT product must be considered in the risk management process. The acquisition and integration of an IoT product into an information system may alter the system’s risk assessment based on new risks introduced by the product. An updated risk assessment may require additional or new controls to be selected and implemented in the system. The guidelines in this publication focus on establishing product cybersecurity requirements to support security controls. This publication provides general considerations of how IoT products may impact an information system’s risk assessment and subsequent allocation of controls that may be necessary. Readers are encouraged to reference Guide for Conducting Risk Assessments, SP 800-30, Revision 1  [3]  and other publications in the  Risk Management Framework (RMF) suite 

of publications for information on assessing risk due to the inclusion of an IoT product into an information system. 

Keywords 

Cybersecurity baseline; Internet of Things (IoT); securable computing devices; security requirements; product security; Risk Management Framework; Cybersecurity Framework. 

Reports on Computer Systems Technology 

The Information Technology Laboratory (ITL) at the National Institute of Standards and Technology (NIST) promotes the U.S. economy and public welfare by providing technical leadership for the Nation’s measurement and standards infrastructure. ITL develops tests, test methods, reference data, proof of concept implementations, and technical analyses to advance the development and productive use of information technology. ITL’s responsibilities include the development of management, administrative, technical, and physical standards and guidelines for the cost-effective security and privacy of other than national security-related information in federal information systems. The Special Publication (SP) 800-series reports on ITL’s research, guidelines, and outreach efforts in information system security, and its collaborative activities with industry, government, and academic organizations. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> ii

Supplemental Content 

The NIST Cybersecurity for IoT Team has undertaken an effort that aims to help manufacturers and federal government organizations better understand the IoT product cybersecurity capabilities and supporting non-technical capabilities that may be needed from or around IoT products used by federal government organizations. To that end, NIST has developed a catalog of IoT product cybersecurity capabilities and supporting non-technical capabilities for manufacturers and IoT product customers. The catalog identifies technical and non-technical capabilities that may be necessary for supporting NIST SP 800-53 Rev. 5  [7]  controls implemented in systems. Just as not every Federal Information Technology (IT) system uses every control, not every capability in the catalog is needed in every IoT product. Ultimately, the goal is to enable organizations to securely incorporate IoT products into their systems and meet their security requirements. The catalog can be found in IoT Guidance for the Federal Government: IoT Device Cybersecurity Requirement Catalog, SP 800-213A,  [18] .

Note to Reviewers 

This Initial Public Draft is the next step in updating SP 800-213. The authors recognize the need for this update is more than a mandate - technical, operational, and risk landscapes have each evolved over these past 5 years. 

The main changes include shifting focus from IoT devices to IoT products, with language updated to be product-focused throughout. These changes are intended to clarify the difference between the ‘product’ and the system it is deployed within, ensure organizations consider all IoT product components, and provide organizations clarity and flexibility related to apply cybersecurity to IoT products. 

The authors emphasize that the scope of this publication is focused on new IoT products – that is, considerations for those acquiring or building IoT products to integrate into their larger systems or ecosystems. 

In this Initial Public Draft, the Cybersecurity for IoT Program is seeking feedback particularly on: 

• Overall changes included in this draft, including the focus on product and efforts to delineate between the product and the system. 

• Whether the introduced terms are clearly defined and clearly related to cyber concepts. 

• Whether terms clearly relate the intended outcomes of the SP 800-213 process (i.e., IoT product cybersecurity requirements) with concepts from the RMF (e.g., security controls, security requirements) 

• Review of the ‘allocation’ definition intended to clarify between the product and system. 

• Are there any additional terms, concepts, examples, etc. that could help clarify or increase relevancy of the discussion for the intended primary audience of federal government organizations. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> iii

Call for Patent Claims 

This public review includes a call for information on essential patent claims (claims whose use would be required for compliance with the guidance or requirements in this Information Technology Laboratory (ITL) draft publication). Such guidance and/or requirements may be directly stated in this ITL Publication or by reference to another publication. This call also includes disclosure, where known, of the existence of pending U.S. or foreign patent applications relating to this ITL draft publication and of any relevant unexpired U.S. or foreign patents. 

ITL may require from the patent holder, or a party authorized to make assurances on its behalf, in written or electronic form, either: 

a) assurance in the form of a general disclaimer to the effect that such party does not hold and does not currently intend holding any essential patent claim(s); or 

b) assurance that a license to such essential patent claim(s) will be made available to applicants desiring to utilize the license for the purpose of complying with the guidance or requirements in this ITL draft publication either: 

i. under reasonable terms and conditions that are demonstrably free of any unfair discrimination; or 

ii. without compensation and under reasonable terms and conditions that are demonstrably free of any unfair discrimination. 

Such assurance shall indicate that the patent holder (or third party authorized to make assurances on its behalf) will include in any documents transferring ownership of patents subject to the assurance, provisions sufficient to ensure that the commitments in the assurance are binding on the transferee, and that the transferee will similarly include appropriate provisions in the event of future transfers with the goal of binding each successor-in-interest. 

The assurance shall also indicate that it is intended to be binding on successors-in-interest regardless of whether such provisions are included in the relevant transfer documents. 

Such statements should be addressed to:  iotsec@nist.gov NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> iv

Table of Contents 

1. Introduction ...................................................................................................................................1 

2. Background Considerations ............................................................................................................5 

2.1.1. Network of Things ........................................................................................................................ 6 

2.1.2. IoT Component Capability Model for Research Testbeds ............................................................ 7 

3. Identifying IoT Product Cybersecurity Requirements for IoT Products ............................................21 

3.2.1. Effects on Threat Sources and Events ........................................................................................ 29 

3.2.2. Effects on Vulnerabilities and Predisposing Conditions ............................................................. 30 

3.2.3. Effects on Likelihood(s) of Occurrence of Threats ..................................................................... 31 

3.2.4. Effects on Magnitude(s) of Impact of Threats............................................................................ 32 

3.2.5. Determine Updated Risk Assessment ........................................................................................ 33 

3.3.1. Identifying Requirements using SP 800-213A ............................................................................ 35 

3.3.2. Identifying Requirements using Other Resources ...................................................................... 36 

4. Understanding Risk Management Options for IoT Products ...........................................................38 

References.......................................................................................................................................44 

Appendix A. List of Abbreviations, and Acronyms .............................................................................47 

Appendix B. Glossary .......................................................................................................................48 

Appendix C. Change Log ...................................................................................................................50 NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> v

List of Figures 

Figure 1 – A Network of ‘Things’ Modelled Using the Five Primitives [Duplicated from SP 800-183] ......6 

Figure 2 – Visual Depiction of the Capabilities of an IoT Component [Duplicated from IR 8316] ............8 

Figure 3 - Visualization of the System and Environment ......................................................................9 

Figure 4 - IoT Products Represented as Enabling or Other Systems ....................................................11 

Figure 5 - IoT Product Represented as a Standalone System ..............................................................12 

Figure 6 - IoT Product in a System Comprised of Other Subsystems ...................................................13 

Figure 7 - IoT Product Components Integrated as Elements of a System.............................................14 

Figure 8 - Information Security Requirements Integration to the Element Level .................................15 

Figure 9 - Role of IoT Product (Technical) Cybersecurity and Non-Technical Supporting Capabilities in Satisfying Security Capabilities and Requirements ............................................................................17 

Figure 10 - Organizations Can Use this Section to Identify IoT Product Cybersecurity Requirements ... 21 

Figure 11 - Steps to Updating a Risk Model and Risk Assessment using New Information about an IoT Product............................................................................................................................................29 

Figure 12: Effects on Risk Assessment due to IoT Product Informs the Risk Assessment of the Entire System.............................................................................................................................................33 

Figure 13: Organizations Can Gather Information to Update the System Risk Assessment and Determine IoT Product Cybersecurity Requirements .........................................................................34 

Figure 14: Likely Outcomes for Organizations based on the Four Determinations Discussed ............... 42 NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> vi

Acknowledgments 

The authors wish to thank all contributors to this publication, including Danna O’Rourke Herrick and Ian Fleming, the participants in workshops and other interactive sessions; the individuals and organizations from the public and private sectors who provided feedback on the preliminary public content; and colleagues at NIST who offered invaluable inputs and feedback. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 1

12345678910 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 

1. Introduction 

IoT technology creates many opportunities for improved organizational efficiencies in support of mission objectives. Definitions of IoT vary, but there is generally agreement that IoT technology bridges operational technology (e.g., sensors and actuators) with information technology (e.g., data processing and networking). 

NIST risk management guidelines help organizations identify, communicate, and satisfy security requirements to support mission and business functions and manage risk across the organization from the system level to the organizational level. As identified in NIST Special Publication (SP) 800-53 Rev. 5, security requirements are “applicable laws, executive orders, directives, regulations, policies, standards, procedures, or mission/business needs to ensure the confidentiality, integrity, and availability of information that is being processed, stored, or transmitted.”  [7]  However, the increasing scale, heterogeneity, and pace of IoT deployment motivates a focus on security requirement support below the information system level, at the system element level. A system element is a discrete part of a system such as a device, equipment, or application that is connected to other system elements and works with them to achieve the system’s goals. The IoT products and associated IoT devices organizations use will frequently be integrated as system elements; this integration will often happen well after the information system’s initial deployment. 

Details: What is an IoT Product? 

This document uses the same definition and scope for an IoT product 

and device that appears in prior Cybersecurity for IoT work such as NIST 

Internal Report (IR) 8228  [22]  and NISTIR 8259  [23] . Additional 

information can be found in the referenced documents and in Sec.  1.1 

of this publication. NISTIR 8228 Section 2 provides additional detail on 

how cybersecurity capabilities are understood relative to IoT products. 

IoT technology may also present security challenges throughout the 

lifecycle if proper considerations are not made during the acquisition 

and integration of an IoT product. Please note, this publication will refer 

to both IoT devices and IoT products, but these terms are not used 

interchangeably. In many cases, an IoT device is related to, but distinct 

from, the IoT product of which it is a component. 

It is important that organizations identify support for system and organizational security capabilities needed from individual system elements including IoT products to help manage risk to the federal information system. As an example, an organization may purchase voice-activated printers and integrate them into the existing enterprise network. Such voice-activated IoT products may need to access backend or cloud components for the processing of voice data and will store received voice data in those components. Organizations must grapple with the challenge that many IoT products lack features and functions that are common in conventional information technology (IT) equipment, and that data and control of the IoT product may be shared outside the traditional information system boundary. Both challenges can cause security concerns. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 2

42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 

To help organizations with these and other IoT-related challenges, this publication provides 

guidelines on considering system security from the product perspective. This allows for more direct identification of needed cybersecurity requirements—the abilities and actions an organization expects from an IoT product and its manufacturer and/or third parties, respectively. 

Purpose and Applicability 

This publication is intended to help organizations incorporate IoT products into an existing information system as system elements. Like other NIST guidelines, organization describes entities of any size, complexity, or positioning within an organizational structure (e.g., a federal agency or, as appropriate, any of its operational elements). A system is an interconnected set of resources that share a common functionality used or operated by an agency, a contractor of an agency, or another organization on behalf of an agency. While the term information systems is used in the document, the scope of the document and concerns discussed could also apply to other systems, including some operational technology (OT) systems. According to NIST guidelines  [2] , [3] , [4] , [5] , [10]  and FIPS 200  [21] , the terms information system and system are synonymous. NIST 800-37 Rev. 2 notes that “there are many types of systems. Examples include: general and special-purpose information systems; command, control, and communication systems; … industrial/process control systems; … medical devices and treatment systems; …”  [4]  Therefore, most OT systems would be considered information systems as well, but the further question remains of the applicability of this publication to a specific system. 

IoT products naturally bring many connections to a system through their actuation and networking capabilities. Any system that includes an IoT device or other IoT product component as a system element will find value in this publication. Further, the scope of this publication is focused on new IoT products – that is, considerations for those acquiring or building new IoT products to integrate into their larger systems or ecosystems. Those concerned with systems that incorporate preexisting IoT products or do not incorporate IoT products at all may find value in the guidelines within this publication as it explains how requirements for individual system elements can be identified or allocated based on system controls; some concepts and discussion may not be applicable to or align with the system of interest. 

IoT products in scope for this publication have at least one IoT device and may have other system components such as additional IoT devices, one or more cloud backends, a mobile app, or a specialized hub. IoT devices in-scope for this publication have at least one transducer (sensor or actuator) for interacting directly with the physical world and at least one network interface (e.g., Ethernet, Wi-Fi, Bluetooth, Long-term Evolution (LTE), Zigbee, Ultra-Wideband (UWB)) for interfacing with the digital world. While an IoT device may be able to function on its own, it may be dependent on other product components for some functionality. While this publication might be helpful for IoT deployments that fall outside this scope or for other situations (e.g., when IoT devices are being integrated as system elements from the conception of an information system), other NIST publications, such as the Risk Management Framework (RMF ) and suite of security standards and guidelines, address those situations more directly. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 3

83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 115 116 117 

Target Audience 

To provide guidelines in line with the  IoT Cybersecurity Act , the target audience of this 

publication is information security professionals, system administrators, and others in federal organizations tasked with assessing, applying, integrating, and maintaining security on a system. Individuals holding the same or analogous roles in other organizations that deploy and manage systems can also use these guidelines, especially if the organization has already adopted the RMF or Cybersecurity Framework (CSF). 

Personnel within the following Workforce Categories and Specialty Areas from the National Initiative for Cybersecurity Education (NICE) Workforce Framework for Cybersecurity  [29]  are most likely to find this publication of interest as are their privacy counterparts: 

• Securely Provision: Risk Management, Systems Architecture, Systems Development 

• Operate and Maintain: Data Administration, Network Services, Systems Administration, Systems Analysis 

• Oversee and Govern: Cybersecurity Management, Executive Cyber Leadership, Program/Project Management and Acquisition 

• Protect and Defend: Cybersecurity Defense Analysis, Cybersecurity Defense Infrastructure Support, Incident Response, Vulnerability Assessment and Management 

Relationship to Other Publications 

This publication uses concepts from the NIST Risk Management Framework, specifically publications such as NIST SPs 800-18 Rev. 1  [2] , 800-30 Rev. 1  [3] , 800-37 Rev. 2  [4] , 800-39  [5] ,800-53 Rev. 5  [7] , and 800-60 Vol. 1 Rev. 1  [10] , as well as 800-160 Vol. 1  [15]  and Vol. 2  [16] , SP 800-82 Rev. 2  [11] , SP 800-161  [17] , and the NIST Cybersecurity Framework  [20] . It also follows from the foundational cybersecurity for IoT work from NIST documented in NISTIR 8228  [22] 

and the NISTIR 8259 series [ [23] , [24] , [25] ]. Details on the relationship to these other publications are in  Sec. 2 .

This publication uses both the terms “security” and “cybersecurity.” For most purposes, these terms are interchangeable and relate to protecting confidentiality, integrity, and availability of data. As a convention, “security” is used when discussing the protection of the system while “cybersecurity” is used when discussing how system elements might support security or protect security themselves. This mixed terminology is motivated by the common use of the term “security” in the RMF. The term “cybersecurity” is used for the same concepts in IoT to avoid confusion with physical security/safety requirements. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 4

118 119 120 121 122 123 124 125 126 127 128 129 130 131 132 

Document Conventions 

This publication uses conventions relative to other RMF guidelines that should be understood: 

This document contains guidelines for federal organizations when acquiring and/or integrating an IoT product into an existing system. 

• Where the term “shall” is used, the statement is to be interpreted as a requirement. 

• Where the term “should” is used, the statement is to be interpreted as a recommendation. 

Publication Organization 

The rest of this publication is organized as follows: 

• Section 2  provides background considerations and connects the challenges presented by 

IoT products with risk management practices discussed in NIST publications. 

• Section 3  details how the background considerations in Section 2 can be used with 

existing sources to identify IoT product cybersecurity requirements. 

• Section 4  describes how an organization can navigate security challenges that arise 

when IoT products do not meet IoT product cybersecurity requirements as anticipated. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 5

2. Background Considerations 133 134 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149 150 151 152 153 154 155 156 157 158 159 160 161 162 163 164 165 166 167 168 169 170 171 

This publication draws from other NIST guidelines, namely the Risk Management Framework (RMF)  [4] , the Cybersecurity Framework (CSF)  [20] , and Cyber Supply Chain Risk Management Practices for Systems and Organizations, NIST SP 800-161,  [17] . Organizations familiar with these guidelines and the context of IoT products within a system could skip this section. It is expected that organizations will follow the RMF steps to manage risk throughout the system development life cycle. As IoT products are introduced to the system, sometimes after the system is in operation, it is critical to consider the security impact of such changes. 

What is an IoT Product? 

IoT products are systems that have at least one IoT device and may have other system components such as additional IoT devices, one or more cloud backends, a mobile app or a specialized hub. IoT devices have at least one transducer (sensor or actuator) for interacting directly with the physical world and at least one network interface (e.g., Ethernet, Wi-Fi, Bluetooth, Long-term Evolution (LTE), Zigbee, Ultra-Wideband (UWB)) for interfacing with the digital world. While an IoT device may be able to function on its own, it may be dependent on other product components for some functionality. 

Using these definitions, the system that forms an IoT product is outlined that contains at least one IoT device but may also have other remote and local product components that support the IoT device’s functionality. As described in Foundational Cybersecurity Activities for IoT Product Manufacturers , NIST IR 8259 Rev. 1  [23] , IoT product components, which make up an IoT product, can contain: 

• IoT devices – local equipment with at least one transducer (i.e., sensor or actuator) and at least one network interface. 

• Specialty networking/gateway hardware – local equipment used to aggregate, translate, forward, or distribute data related to the IoT product across networks (e.g., a hub within the system where the IoT device is used). 

• Companion application software – code executed on local equipment outside of the IoT product boundary (e.g., personal computer, smartphone) that interfaces with other IoT product components (e.g., a mobile app for communicating with the IoT device). 

• Backends – remote service that supports one or more IoT product components (e.g., a cloud service, or multiple services, that may store and/or process data from the IoT device). 

Some components may be clearly part of an IoT product, such as specialty networking/gateway hardware, without which IoT devices may not be able to communicate with each other or the internet. Other components may support some, but not all features, such as backends or companion application software, the absence of which may reduce functionality, but not render the IoT devices completely useless. This perspective of IoT products is based around IoT product components operating together to deliver the IoT functionality. Use of this perspective NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 6

172 173 174 175 176 177 178 179 180 181 182 183 184 185 186 187 188 189 190 191 192 

helps identify physical and logical IoT product components that can impact the cybersecurity of 

the IoT device or devices. 

The following subsections present concepts from other NIST publications that can help readers understand IoT product system boundaries. 

2.1.1. Network of Things 

In Network of ‘Things’ , NIST SP 800-183  [33] , the so-called Networks of Things (NoTs) are made from conceptual building blocks called primitives and are synonymous with IoT. The primitives discussed include: 

• Sensors – electronic utilities that measure physical properties. 

• Aggregators – software that implements mathematical functions to transform raw data to intermediate, aggregated data. 

• Communication Channel – a medium by which data is transmitted. 

• eUtility – a software or hardware product or service. 

• Decision Trigger – creates the final results needed to “satisfy the purpose, specification, and requirements of a specific NoT.” 

In its proposed model, which is focused on data-flow, these primitives work together to create, transmit, and process data to achieve the purpose of an NoT.  Figure 1 , copied from SP 800-183, shows how sensors, aggregators, communication channels, eUtilities, and decision triggers can be used to model a NoT. 

> Figure 1 – A Network of ‘Things’ Modelled Using the Five Primitives [Duplicated from SP 800-183] NIST SP 800-213r1 ipd (Initial Public Draft) June 2026
> 7

193 194 195 196 197 198 199 200 201 202 203 204 205 206 207 208 209 210 211 212 213 214 215 216 217 218 219 220 221 222 223 

The model proposed in SP 800-183 can be helpful for some readers to understand how data 

flows in the IoT product they seek to use. In particular, the data flow focused model can be helpful in identifying the boundaries of an IoT product. For example, since, as SP 800-183 states, most NoTs will contain all five primitives, an IoT product can be assessed to determine if all five primitives are reflected in the data flow across all IoT product components. It is recognized that while many organizations will purchase commercially-available IoT products, other organizations may choose to assemble IoT products using available off-the shelf devices, equipment, software, and components. If the deploying organization is assembling IoT products (e.g., using off-the-shelf devices, equipment, software, and components), SP 800-183 can also help designers think through the data-centric perspective of their IoT product. 

2.1.2. IoT Component Capability Model for Research Testbeds 

In Internet of Things (IoT) Component Capability Model for Research Testbed, NIST IR 8316  [34] ,describes the connecting of IoT components 1   

> 1IoT components is a distinct term from IoT product components . IoT components are parts of an IoT system, as defined in NISTIR 8316. IoT product components are the parts necessary to use an IoT device and constitute an IoT product as defined in this publication as well as NISTIR 8259.

to compose IoT systems, which in turn compose IoT environments. NIST IR 8316 defines an IoT component as: 

• “the basic building blocks of IoT systems” which 

• “interact[s] with other IoT components to form a system” and 

• “provides some function that is necessary within the system so it may achieve its goal(s).” 

This definition anchors IoT components within the IoT systems they are deployed to since this definition states that IoT components provide necessary functionality for a system to achieve its goals. In this context, the IoT component capability model identifies several kinds of functions that can be used by an IoT system to achieve its goals. These capabilities are: 

• Transducer capabilities – “the ability for computing systems to interact directly with physical entities of interest.” 

• Data capabilities – “data storing, transferring, and processing” 

• Interface capabilities – “the ability to interact with other IoT components” 

• Supporting capabilities – “indirectly involved in providing functionality to the system, such as monitoring, management, security, or orchestration.” 

• Latent capabilities – “transducer, data, interface, or supporting capabilities that are not currently enabled and accessible outside the IoT component.” 

Figure 2  depicts this model. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 8

224 225 226 227 228 229 230 

> Figure 2 – Visual Depiction of the Capabilities of an IoT Component [Duplicated from IR 8316]

Though intended for use within the context of research testbeds, the IoT component capability model and its capability-focused view can be a useful perspective to complement those of this publication and SP 800-183. This model could help identify the capabilities desired from an IoT product or individual IoT product component, which can in turn inform cybersecurity capabilities needed to ensure the cybersecurity of the IoT product. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 9

231 232 233 234 235 236 237 238 239 240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 

Systems and Elements 

> Figure 3 - Visualization of the System and Environment

As discussed in  Sec. 1 , federal cybersecurity risk management processes generally consider the 

security of organizations and systems. Further, these systems are made up of elements, which themselves are implemented with hardware and software. Increasingly, IoT devices and other IoT product components may become elements of systems. The relationship between systems and elements is a foundational concept in this publication. To understand more about this relationship between systems and elements, readers should refer to NIST Special Publication 800-37, Revision 2, Risk Management Framework for Information Systems and Organizations: A System Life Cycle Approach for Security and Privacy  [4] . Some of the key concepts, particularly those covered in Section 2.4 of SP 800-37 Rev. 2, will be highlighted here.  Figure 3  shows these concepts visually, adapted from a figure in  [4] .

An information system “is a set of interacting elements that are organized to achieve one or more stated purposes.”  [28]  Information systems are defined by the authorization boundary, which for systems will encapsulate elements owned and operated by organizations. The information system can also be supported by other enabling systems, which will fall outside the authorization boundary. Information systems can also interact with other systems, which might be beneficiaries of capabilities offered by the information system. The system, as defined by the authorization boundary—as well as some enabling systems and other systems—will fall within the environment of operation, which is the physical environment in which these systems reside and operate. See SP 800-37  [4] , specifically Section 2.5 and Appendix G for additional guidelines on authorization boundaries for federal systems. 

As explained in SP 800-37  [4] , organizations define and determine the parts of the environment of operation that are within the authorization boundary of each federal system.  Figure 3  shows NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 10

256 257 258 259 260 261 262 263 264 265 266 267 268 269 270 271 272 273 274 275 276 277 278 279 280 281 282 283 284 285 286 287 288 289 290 291 292 293 294 295 296 297 298 

how the environment of operation can contain multiple authorization boundaries, including 

other systems and enabling systems. Elements may interact and communicate across multiple systems/authorization boundaries. However, for accountability and risk management purposes, each element is only included within one authorization boundary. Each IoT device will be contained in one authorization boundary, and risk management would be handled by the organization responsible for the assigned authorization boundary. The interoperable nature of IoT and mission benefits that can come from reuse of existing equipment and deployments could create situations where the IoT device and/or its data are used by multiple systems. There may be some limited risk management responsibilities that other organizations and systems that use the IoT device and/or its data may have. For example, an urban sensor system deployed by Agency A may have benefits if the data it creates was used by a system deployed by Agency B. Though the IoT devices in the sensor system would be within an authorization boundary managed by Agency A, Agency B may allocate security requirements and have to implement controls around their use of the sensor system’s data to meet government-wide requirements. Allocation refers to “the process an organization employs to assign security or privacy requirements to an information system or its environment of operation; or to assign controls to specific system elements responsible for providing a security or privacy capability (e.g., router, server, remote sensor).”  [4]  Allocation is pertinent to this publication since the fact that security requirements are allocated to IoT products and IoT product components is a core motivation of the guidelines provided. In other words, this publication is aimed at helping organizations manage the allocation of security requirements to IoT products. 

The concept of systems and elements can help clarify the ways IoT products and their comprising IoT product components might be conceptually viewed by organizations to support the identification and allocation of product cybersecurity requirements. Considering that IoT products are usually comprised of multiple IoT product components and can include IoT devices, companion software applications, specialty network hardware (which can be considered distinct from IT network infrastructure), and remote services, organizations have flexibility in how they assemble elements into systems and subsequently draw authorization boundaries. Organizations therefore also have flexibility in conceptually viewing how IoT products and product components are added to their systems. 

Relative to other systems managed by the organization, some IoT products should be characterized as an “enabling” or “other” system if its component IoT device and other IoT product components is managed in a different authorization boundary than the organization’s system. As discussed in SP 800-37  [4] , an enabling system is one that “may provide common controls for the system or may include any type of service or functionality used by the system,” and other systems as those “also outside the authorization boundary and may be the beneficiaries of services provided by the system or may simply have some general interaction.” SP 800-37  [4]  goes further to note that the risk management of these kinds of systems would be “addressed within their respective authorization boundaries.” An example of this type of other system might be a building or campus monitoring system that is primarily autonomous. Such a system will mainly benefit from some of the federal system’s capabilities (e.g., an internet connection, access to data within the authorization boundary), while implementing its own security controls.  Figure 4  shows how an IoT product can be visualized relative to a system NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 11

299 300 301 302 303 304 305 306 307 308 309 310 311 312 313 314 315 316 317 318 319 320 321 322 323 324 

and how they can exist as enabling or other systems within or outside the environment of 

operation. Note in this case the IoT product is placed clearly outside the authorization boundary. 

> Figure 4 - IoT Products Represented as Enabling or Other Systems

Consider: Cybersecurity Responsibility Related to Enabling and Other 

Systems 

Considering an IoT product as an enabling or other system does not 

alleviate all cybersecurity considerations on the part of an organization. 

The IoT product will still exist in another authorization boundary, which 

may or may not be managed by organizations that do not necessarily 

use the RMF (e.g., the product manufacturer, third-party service 

provider). That organization (i.e., that manages the IoT product within 

their authorization boundary) would have to be responsible for many 

aspects of risk management related to the IoT device, but any 

organization that uses the IoT device directly, services it provides, 

and/or its data will have responsibilities related to cybersecurity of that 

IoT device and its data. Readers of this document should refer to NIST 

Cyber Supply Chain Risk Management Practices for Systems and 

Organizations, SP 800-161 Revision 1,  [17]  to understand these 

responsibilities and supporting practices. 

Many IoT products will require some integration and management by the customer organization, and so IoT products may also be placed inside the authorization boundary as a subsystem. In this context, organizations can still view the IoT product and its components as a standalone system, but now there will likely be different implications for cybersecurity and the organization that will come with placement within the authorization boundary.  Figure 5  shows NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 12

325 326 327 328 329 330 331 332 333 334 335 

how an agency can visualize this scenario for an IoT product comprised of an IoT device, 

companion application, specialty networking hardware, and remote service. 

> Figure 5 - IoT Product Represented as a Standalone System

Other IoT products acquired by organizations may be best characterized with some or all IoT product components integrated as a subsystem or element of the system defined by the authorization boundary of a larger system. Organizations have flexibility in how they organize system elements and subsystems within their managed authorization boundaries, and they may have several considerations that drive a particular system view. For example, a system may be assembled primarily from IoT products and other solutions implemented by subsystems. Such a system may be best viewed as shown in  Figure 6 .NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 13

336 337 338 339 340 341 

> Figure 6 - IoT Product in a System Comprised of Other Subsystems

For other deployments, the locally managed IoT product components (e.g., IoT device, companion applications, specialty networking hardware) may be considered elements of the system, which may be comprised of other elements as well.  Figure 7  illustrates this view of an IoT product as part of a system. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 14

342 343 344 345 346 347 348 349 350 351 352 353 354 355 356 357 358 359 360 361 362 363 364 365 366 367 

> Figure 7 - IoT Product Components Integrated as Elements of a System

In either of the cases depicted in  Figure 6  or  Figure 7 , some IoT product components will fall within an authorization boundary it shares with other system elements. As such, organizations may have significantly more expectations about how this IoT product must support the security controls of the information system and organization due to overall requirements allocation. When security requirements are allocation to IoT products, technical capabilities may be expected from IoT product components to support information system controls; similarly, organizations may depend on non-technical capabilities provided by manufacturers or third parties to support information system controls. 

If the IoT product lacks technical or non-technical capabilities to support the information system’s security controls, challenges can arise for the organization to manage risk. In this situation, technical or non-technical capabilities lacking in one IoT product component might be provided by other product or system elements or systems (e.g., IoT hub, cloud service, mobile app), or the organization might choose to implement compensating controls (e.g., creating a segmented network for IoT) or reimplement existing controls (e.g., changing a policy or procedure for a control in response to IoT limitations). If risk(s) introduced by the IoT product cannot be mitigated within the organization’s risk tolerance level, the organization could accept these new risks or decide not to incorporate the IoT product into the information system. 

This publication can apply to IoT products and product components in all scenarios as presented here but is primarily aimed at IoT products where some or all IoT product components are treated as system elements since the organization typically has greater responsibility and control over these types of IoT products. Understanding the relationship of the IoT product and its components to the system is important to properly define the cybersecurity requirements needed to support organizational and system security requirements. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 15

368 369 370 371 372 373 374 375 376 377 378 379 380 381 382 383 384 385 386 

How IoT Products Support Security 

The relationship of an IoT product and its IoT product components to an information system provides context to understand how an IoT product’s components support both system and organizational objectives. Managing Information Security Risk: Organization, Mission, and Information System View, NIST SP 800-39,  [5] , discusses how higher-level mission and organizational objectives inform the architecture and control structure around information systems. In this publication, we extend the discussion from  [5] , highlighting the connection between systems and elements as discussed in SP 800-37  [4]  and  Sec. 2.1  above.  Figure 8  shows 

the connection between the concepts discussed in  [5]  and system elements. 

> Figure 8 - Information Security Requirements Integration to the Element Level

SP 800-39  [5]  describes how the organization’s risk management strategy informs the enterprise architecture, including the information security architecture. Key to the information security architecture is the identification of security requirements and the selection and allocation of security controls. Information security architecture informs the federal systems within the environments of operation, particularly through the application of security controls. This publication focuses on IoT products as system elements. When security requirements for the system are therefore allocated to the IoT device and other IoT product components, this implies support for the system and its security controls. We can call these allocated security requirements IoT product cybersecurity requirements when identifying them for IoT products. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 16

Consider: How IoT Product Cybersecurity Requirements Can Be 387 388 389 390 391 392 393 394 395 396 397 398 399 400 401 402 403 404 405 406 407 408 409 410 411 412 413 414 415 416 417 418 419 420 421 422 

Building Blocks for Success 

In the context of this document IoT product cybersecurity requirements 

refers to the cybersecurity support necessary from an IoT product to 

support the deploying organization and systems. IoT product 

cybersecurity requirements state the technical and non-technical 

support needed from an IoT product that will be a system element, 

system, or subsystem to which security controls will be allocated. 

Technical support are features or functions implemented using 

hardware or software, and the technical support allocated to IoT 

devices or other IoT product components are called IoT product 

cybersecurity capabilities .

Note, there is a reflective relationship, but critical distinction, between system cybersecurity controls and the IoT product cybersecurity capabilities that are needed to support them. IoT product cybersecurity capabilities reflect the technical support needed across a system to support security controls. Therefore, IoT product cybersecurity capabilities may not be unique to the IoT product and could be the same as would be expected from any other system element. For example, an organization may require that data be protected while at-rest, which includes when product data is stored on the IoT device and in a remote service. In this case, both IoT product components should implement strong encryption and data access controls, as would be expected for other system elements or subsystems that the organization can use to meet its requirement to protect data at-rest. The hardware and software along with the resulting features and functions that are used to implement technical cybersecurity capabilities may vary for different IoT product components even if they are supporting the same cybersecurity control. For example, organizations commonly require all software to be kept up to date. For locally managed IoT product components, this may require the organization using the IoT product to perform an action to apply the update, but for remote services, the organization that manages that service will ensure software updates are applied. 

In addition to technical means, non-technical support can also be critical in supporting the application of system security controls. Therefore, allocated cybersecurity requirements can also include non-technical supporting capabilities , which are actions that manufacturers or third parties take in support of the initial and on-going security of IoT products. Since non-technical supporting capabilities are implemented using procedures and processes rather than hardware and software, non-technical supporting capabilities may be able to be implemented for an IoT product, including all of its product components, with one instantiation. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 17

423 424 425 426 427 428 429 430 431 432 433 434 435 436 437 438 439 440 441 442 443 444 445 446 

Details: Example IoT Product and Non-Technical Supporting 

Capabilities 

For an IoT product such as a smart appliance, a cybersecurity capability 

could be the ability to establish, manage, and enforce authentication 

and authorization for entities that attempt to access the IoT device, 

other product components or data that the product produces or 

transmits. A corresponding non-technical supporting capability could be 

manufacturer-provided instructions on how authentication and 

authorization policies can be established and managed in the product. 

Both IoT product cybersecurity capabilities and non-technical supporting capabilities are vital to organizations’ ability to implement controls that the organization has allocated for their information systems.  Figure 9  illustrates how IoT product cybersecurity capabilities and non-technical supporting capabilities (grouped together as ‘IoT Product Cybersecurity Requirements’) support system/organizational security capabilities, which in turn satisfy organizational security requirements. 

> Figure 9 - Role of IoT Product (Technical) Cybersecurity and Non-Technical Supporting Capabilities in Satisfying Security Capabilities and Requirements

Selecting, allocating, and implementing security controls to information systems are key tasks of the RMF Select and Implement Steps. See SP 800-37  [4]  for more information and detailed task descriptions of the Select and Implement Steps. Controls used by federal agencies are selected from Security and Privacy Controls for Information Systems and Organizations, NIST SP 800-53, Revision 5,  [7] . These controls are technology agnostic and can apply to IoT products incorporated into systems as system elements. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 18

447 448 449 450 451 452 453 454 455 456 457 458 459 460 461 462 463 464 465 466 467 468 469 470 471 472 473 474 475 476 477 478 479 

For more background on the topic of how IoT products can support cybersecurity, the NISTIR 

8259 series discusses the concept of IoT product cybersecurity extensively from the manufacturer’s perspective—that is, for manufacturers to understand the capabilities that customers need in IoT devices. But the information in the NISTIR 8259 series could also be helpful for organizations as they acquire and integrate IoT devices. 

NISTIR 8259, Foundational Cybersecurity Activities for IoT Product Manufacturers  [23] , while focused on manufacturers, can help organizations consider their needs and goals related to IoT products. In particular, NISTIR 8259 highlights how IoT products will likely be developed with a specific customer and use case as a target. Further, NISTIR 8259 discusses the importance of device cybersecurity capabilities to customers since they help customers help customers in their role as deployer, meet their security requirements. In light of this, NISTIR 8259A, IoT Device Cybersecurity Capability Core Baseline  [24]  provides a starting point for IoT product cybersecurity capabilities needed by many customers in many IoT use cases to support various cybersecurity risk mitigation goals. Likewise, NISTIR 8259B, IoT Non-Technical Supporting Capability Core Baseline  [25]  is a starting point for non-technical capabilities provided by manufacturers and/or third parties (i.e., supporting entities) that also support customers’ cybersecurity risk mitigation goals. 

Details: Difference between the IoT Core Baselines and SP 800-53B 

Control Baselines 

Readers may be familiar with the low-, moderate-, and high-impact 

security control baselines in Control Baselines for Information Systems 

and Organizations, NIST SP 800-53B,  [8] . The IoT core baselines are 

distinct from the SP 800-53B security control baselines. The IoT core 

baselines define high-level IoT product cybersecurity capabilities and 

non-technical supporting capabilities, while SP 800-53B security control 

baselines provide a risk-based starting point for security control 

selection. The IoT product cybersecurity capabilities and non-technical 

supporting capabilities presented in the IoT core baselines enable IoT 

devices to support the controls in a SP 800-53B control baseline. SP 800-

213A, IoT Device Cybersecurity Guidance for the Federal Government: 

IoT Device Cybersecurity Requirement Catalog provides more specific 

capabilities than the IoT core baselines that are targeted at SP 800-53 

security controls. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 19

480 481 482 483 484 485 486 487 488 489 490 491 492 493 494 495 496 497 498 499 500 501 502 503 504 505 506 507 508 509 510 511 

How IoT Products May Create Security Challenges 

Integrating an IoT product into a system can present a number of challenges for organizations. Organizations should strive to understand these challenges before an IoT product is acquired and integrated into a system. Due to a number of market and technological factors, IoT devices or IoT products often lack cybersecurity functionality commonly present in conventional IT equipment (e.g., laptops). For example, an IoT product’s remote service may not meet geographic and jurisdictional requirements for an organization seeking to retain control over their data. Support for multi-factor authentication for all IoT product components, particularly IoT devices, may be limited. Some IoT product components may have computing resource constraints that inhibit the adoption of some encryption modules. 

An IoT product could introduce unacceptable levels of risk to the system when it lacks particular cybersecurity functionality or support. This cybersecurity functionality or support can be called a key cybersecurity requirement . Key cybersecurity requirements are those the organization has determined the IoT product must possess and/or manufacturers and supporting entities must provide for the device to be integrated into the system. Key cybersecurity requirements are important to consider because without them, an IoT product cannot be considered “securable” by the organization and will not be able to be used as intended or possibly at all. If other cybersecurity requirements (i.e., those not considered key) are lacking from the IoT product or manufacturers and supporting entities, other IoT product cybersecurity and/or non-technical supporting capabilities or other security controls entirely could possibly be compensating. This gives organizations options when encountering challenges integrating and using IoT products. Thus, organizations should consider all IoT product cybersecurity requirements needed to support security controls, but also carefully assess which requirements they consider key, ensuring they are limited to those that must be supported through the product or by the manufacturer and/or supporting entities. 

NISTIR 8228, Considerations for Managing Internet of Things (IoT) Cybersecurity and Privacy 

Risks  [22]  details some of these challenges that IoT devices can create for organizations. The challenges described in NISTIR 8228 represent generic, high-level use cases. For specific organizations or particular IoT devices and IoT products, the challenges faced could diverge from those explored in NISTIR 8228. Organizations are nonetheless encouraged to apply the concepts in NISTIR 8228 to identify challenges applicable to their use cases. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 20

Details: Overview of NISTIR 8228 Concepts 512 513 514 515 516 517 518 519 520 521 522 523 524 525 526 527 528 529 530 531 532 533 534 535 536 537 538 539 540 541 542 543 544 545 546 

NISTIR 8228 explores a number of challenges, grouped around 

conventional risk mitigation areas such as asset management, data 

protection, incident detection, and vulnerability management. The 

publication further groups these areas into goals of protecting device 

security, data security, and/or individual privacy. Challenges can arise 

that hinder risk mitigations in various areas or could impact some or all 

of the goals. For example, to mitigate risks related to vulnerability 

management, software updates may need to be performed. However, 

not all IoT devices allow for software updates (Challenges 8, 10, and 11). 

Even mitigations as simple as hiding passwords might not be achievable 

on IoT devices (Challenge 17). 

Organizations should not underestimate the challenges of integrating an IoT product into an information system. Systems Security Engineering: Considerations for a Multidisciplinary Approach in the Engineering of Trustworthy Secure Systems, NIST SP 800-160, Volume 1,  [15] 

demonstrates how an integrated process is best for engineering trustworthy systems. SP 800-160 Vol. 1 presents concepts reflected in other NIST SPs from a system engineering perspective, giving a detailed look at how trustworthy systems can be engineered. The approach outlined in SP 800-160 Vol. 1 considers acquisition of elements and other system components earlier in the system design process than integration of these pieces. Adequate acquisition and integration processes are important concepts from SP 800-160 Vol. 1 that can help organizations ensure the trustworthiness of their systems. 

Systems will be initially designed and implemented (i.e., prepared, categorized, etc.), but then modified as system elements are removed or other elements added. When an IoT product is added as a system element—typically as a subsystem—organizations should consider how the integration of the IoT product as a subsystem could impact the information system and broader security requirements. However, integrating an IoT product into an information system can also be aided by taking a more focused look at the IoT device. Taking this device-centric perspective, an organization can identify and articulate the IoT product cybersecurity requirements (i.e., the set of IoT product cybersecurity capabilities and non-technical supporting capabilities) required from IoT devices and manufacturers/third parties to support security capabilities and satisfy security requirements as well as the overall product cybersecurity requirements. Organizations should be aware that even if the allocated IoT product cybersecurity requirements are provided by a device and manufacturer/third party, the integration of the IoT device into an information system can still introduce risk. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 21

547 548 549 550 551 552 553 554 555 556 557 558 559 560 561 562 563 564 565 566 567 568 569 570 571 572 573 574 575 

3. Identifying IoT Product Cybersecurity Requirements for IoT Products 

This section provides organizations guidelines for determining the applicable cybersecurity requirements (i.e., the set of cybersecurity capabilities and non-technical supporting capabilities) needed to secure the IoT product and support system security controls. The high-level process is shown in  Figure 10 .

> Figure 10 - Organizations Can Use this Section to Identify IoT Product Cybersecurity Requirements

Section 3.1  provides an overview of important IoT cybersecurity considerations. The questions 

in section 3.1 help organizations contemplate the IoT use case, providing a foundational understanding of how the IoT product might impact risk to the system.  Section 3.2  discusses 

how an understanding of the IoT use case can impact the system’s risk assessment and the subsequent allocation of security controls to the information system.  Section 3.3  focuses on 

determining applicable IoT product cybersecurity requirements based on the risk assessment and controls allocation from Section 3.2. The section presents sources of IoT product cybersecurity requirements. Organizations may reference these sources when selecting applicable IoT product cybersecurity requirements. 

Each organization should develop a process for identifying and articulating IoT cybersecurity requirements that aligns with their existing policies and procedures (e.g., acquisitions, security, system administration). 

Consider: Coordinate Early Within the Organization to Acquire IoT 

Products 

Readers should be aware that even once IoT product cybersecurity 

requirements are identified and a suitable IoT product is found on the 

market, procurement challenges may arise. Some organizations 

maintain exclusion lists that prohibit the procurement of commercially-

available products based on country of origin or other criteria. For that 

reason, it is advisable to begin communicating as early as possible with 

applicable organizational personnel to navigate through any 

organizational restrictions. NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 22

576 577 578 579 580 581 582 583 584 585 586 587 588 589 590 591 592 593 594 595 596 597 598 599 600 601 602 603 604 605 606 607 608 609 610 611 612 613 614 615 

The guidelines presented in this publication provide a starting point for organizations—as well 

as additional resources organizations can use—in identifying IoT cybersecurity requirements. The steps described in this section happen before an IoT product is purchased and/or integrated. At this stage, the IoT product itself may not be in the organization’s possession, which may result in some considerations, particularly those related to how risks can be mitigated, not being entirely known. Information about additional IoT product and support limitations should be identified through further engagement with the available manufacturers and vendors. 

IoT Cybersecurity Considerations 

There are many reasons to integrate an IoT product into a system (e.g., to achieve business objectives, further technical advancements, provide administrative support). The reason the IoT product is being acquired will determine its use case. For one organization, IoT sensors may be sought to help remotely monitor environmental conditions; another organization may acquire IoT office equipment to increase productivity; still other organizations may seek to leverage IoT technology in the delivery of services to citizens. 

Organizations should fully understand the specific use case for an IoT product since the use case could impact risk to the system and organization. The following questions can help organizations think through some of the common considerations for acquiring IoT products, but this list is not exhaustive. The answers to these and other questions can ultimately help organizations assess risk and identify IoT cybersecurity requirements for their use case(s). Accurately and completely answering these questions for many IoT products will require consultation with IT personnel within the organization. 

1. Are there commercially available products that meet the use case for the IoT product or will the IoT product be custom or customized using other components? Before a product can be integrated into a system, it must exist – leading organizations to the question of “build or buy?”. That is, the product must be created internally or acquired from a third party. The build-or-buy decision is a governance matter, not simply a technology or procurement choice, because it drives distinct cybersecurity considerations, controls responsibilities, and risk management approaches. Products that are built internally and those acquired from third parties carry different risk profiles, and require different stakeholder involvement (e.g., procurement, engineering, legal, compliance, leadership). Notably, the decision typically needs to be made upstream of integration, as the engineering vs. sourcing needed to enable the device precedes its integration. As such, the build-or-buy decision should be addressed as an early, cross-stakeholder governance decision with executive visibility into why the decisions were made. 

2. What is the expected benefit of the IoT product and how will it be used? Organizations can help ensure that cybersecurity requirements receive proper consideration by establishing the benefit(s) explicitly for integrating the IoT product and understanding how it will be used. For example, if the IoT product is replacing equipment that did not previously connect to the system, organizations should holistically consider the benefit NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

23 

616 617 618 619 620 621 622 623 624 625 626 627 628 629 630 631 632 633 634 635 636 637 638 639 640 641 642 643 644 645 646 647 648 649 

of the connection to the system compared to the potential risks. It may be the case that a connected motion sensor can detect potential intruders but may also introduce security vulnerabilities that may outweigh the proposed benefits. 

3. What data is collected? IoT products can collect many kinds of data, some innocuous, others of concern to organizations. Any data collected could be a risk to the organization. All data collected or reported by the IoT product should be understood, but three main types of data may be of concern: 

a. Personal data: Many IoT products can sense or collect data of, from, or about people, which can constitute personal data and represent privacy sensitive data (e.g., Personally Identifiable Information). 

b. Confidential organizational/Federal government data: The IoT product may collect restricted or confidential data (e.g., Controlled Unclassified Information, Intellectual Property), which could influence its risk level. For example, IoT products may help create or have access to organization-restricted test results, analysis materials, or device prototypes that require special protection. 

c. Environmental data: Many IoT products can sense and/or collect data of, from, or about the physical environment. Organizations should consider whether the collection of environmental data poses any risk to individuals or the organizational mission. 

4. In what technologies will the data be stored and how will it be transmitted? Many IoT products rely on connections to cloud services and mobile/web applications. These are part of their architecture and central to the product’s functionality. IoT products can also connect to additional external services, which may be provided and hosted by a number of third parties, across a range of platforms. Organizations should consider where the IoT product might store data —in the device, the manufacturer’s network, a manufacturer-contracted entity’s network (e.g., cloud service provider 2         

> 2As a reminder, if an IoT device uses cloud computing technologies, organizations need to refer to NIST SP 800-144, Guidelines on Security and Privacy in Public Cloud Computing [13] for additional information on cloud security considerations, as well as SPs 800-145, The NIST Definition of Cloud Computing [14] and 800-146, Cloud Computing Synopsis and Recommendations [31] for additional information on cloud computing and storage technologies. Finally, NIST SP 500-292, NIST Cloud Computing Reference Architecture [1] may be a useful additional resource for organizations.

), etc. Cloud services are increasingly used as part of the core IoT product’s functionality, enabling authentication, managing updates, storing telemetry, and data transit. Organizations should also consider how the data will be secured in transit as connections to external services and third parties are made and used. Further, products supporting federal systems are subject to  FedRAMP  requirements as part of the acquisition process. 

5. In what geographic areas will the data be shared or stored? The architecture that supports IoT products is increasingly global. Organizations should consider where data from prospective IoT products will be transmitted and stored to ensure applicable NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 24

650 651 652 653 654 655 656 657 658 659 660 661 662 663 664 665 666 667 668 669 670 671 672 673 674 675 676 677 678 679 680 681 682 683 684 685 686 687 688 689 

security requirements are met. An IoT product may connect to and transmit data to 

systems in many diverse areas, including other cities, states, and countries. These connections may change over time due to the dynamic nature of IoT systems. 

6. With what other third parties will data from, or about, the IoT products be shared or stored? In some product architectures, an IoT product will only exchange data with the owner and manufacturer-owned and operated systems. In other instances, the IoT product will share data with third parties. For example, many manufacturers use cloud storage and services from other providers to support their IoT products’ backend infrastructure. 

After understanding the contextual and structural considerations about the IoT product discussed above, organizations should consider the following questions about how the IoT product will interact with the organization and information system: 

1. Might the product interfere with other aspects of operations or system functionality? 

Unlike conventional IT equipment, IoT products are more likely to interact with the physical world through sensing and/or actuating. This interaction increases the possibility that an IoT product could affect the organization’s operations and the environment (e.g., alarms, thermostats, environmental controls, heating elements) as well as the security posture of the system. For example: 

a. Could the IoT product introduce privacy or safety risks for people? IoT products could collect and share sensitive data about people, including, but not limited to, audio and video data. An IoT product can also interact with the physical world (e.g., IoT vehicle) or might be intended to protect human safety (e.g., an IoT smoke alarm), potentially posing safety risks. Considering if an IoT product may introduce privacy or safety risks is critical to planning for risk mitigation. 

b. Could the IoT product interfere with system reliability or resiliency? The diversity of IoT product use cases also creates the possibility that the IoT product’s expected operational environment may vary from where it is actually deployed. In such an instance, the IoT product might negatively interact with other system elements or operational systems if not properly planned for. For example, an IoT device may go offline to apply a software update. This behavior is acceptable in many circumstances but may impact system reliability if the offline device hurts operations in other parts of the system. Likewise, IoT product components may not be as digitally and physically resilient as their IT or OT counterparts since IoT products must sometimes attempt to deliver both IT and OT functionality. This can lead to inherent practicality and cost constraints that result in a focus or prioritization of some features or aspects of functionality over others (e.g., safety over cybersecurity) in the design of the IoT product. 

2. Would the IoT product introduce unacceptable risks to the organization or result in non-compliance with cybersecurity requirements? Some IoT products might be unable to support the organization’s current security controls as they are implemented due to NIST SP 800-213r1 ipd (Initial Public Draft) June 2026 

> 25

690 691 692 693 694 695 696 697 698 699 700 701 702 703 704 705 706 707 708 709 710 711 712 713 714 715 716 717 718 719 720 721 722 723 724 725 726 727 728 729 730 731 

their design, requiring organizations to implement compensating controls (e.g., 

additional organizational controls or alternative technical controls) to manage risk. Organizations should consider the proposed IoT product use case and whether the risk introduced is acceptable. In some use cases, the IoT product might provide an additional point of access to the system from which an attacker could pivot to other system elements or networks. 

3. Does the IoT product have known security and/or privacy vulnerabilities? Like all connected products, IoT products attract attention from security professionals and researchers who identify security and/or privacy concerns. Manufacturers also commonly publish similar information concerning their products. Understanding known vulnerabilities can inform an organization’s acquisition, risk assessment, and possible integration of an IoT product. For example, if known vulnerabilities exist that the manufacturer cannot mitigate, organizations would have to identify and address risks introduced by the IoT product through other means. 

As discussed extensively in NISTIR 8228  [22] , IoT devices can have significantly different feature sets compared to conventional IT devices. These differences in device capabilities and support for security controls can create challenges for organizations if not adequately planned for, especially if the capabilities diverge significantly from what is expected. Organizations should refer to NISTIR 8228 and consider if the IoT product will create any security and privacy challenges for the information system and organization. One common way challenges arise is when an IoT product does not fully support key cybersecurity requirements . For example, a pillar of Zero Trust Architectures is that devices (of all kinds) are secure and comply with policy, which includes limitation of access in line with zero trust principles  [32] . Thus, support for zero trust principles could be considered part of an IoT product’s key cybersecurity requirements if it will access systems that implement a zero-trust architecture. 

Organizations may reduce these challenges by considering important aspects of how the IoT product should connect and function to ensure the product conforms with expectations, and thus, may define, inform, or otherwise impact key IoT product cybersecurity requirements. In particular, organizations should consider: 

1. What organization-specific considerations are important to defining key cybersecurity requirements? Organizations often invest in specific solutions or imple
