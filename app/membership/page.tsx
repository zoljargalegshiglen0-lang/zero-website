"use client";
import { useState } from "react";
import { Icon } from "@/components/icon";
import { PageHeading } from "@/components/page-heading";

const tiers=[
  {name:"VOID",color:"void",tag:"SIGNAL / I",features:["VOID profile badge","Custom profile accent","Community role","Extended profile stats"]},
  {name:"PHANTOM",color:"phantom",tag:"SIGNAL / II",features:["PHANTOM profile theme","Animated badge preview","Exclusive profile frame","Community spotlight","Event access preview"]},
  {name:"ECLIPSE",color:"eclipse",tag:"SIGNAL / III",features:["ECLIPSE identity pack","Custom profile layout","Exclusive visual effects","Clan profile highlight","Priority community support"]},
  {name:"SINGULARITY",color:"singularity",tag:"SIGNAL / IV",features:["All visual identity options","Season founder mark","Custom name treatment","Special community role","Early feature preview","Direct staff support"]},
];

export default function MembershipPage(){const[selected,setSelected]=useState("PHANTOM");return <main className="page-wrap"><PageHeading icon="crown" eyebrow="IDENTITY TIERS" title="MEMBERSHIP" description="Choose your identity."/><div className="role-showcase"><div><span>CURRENT PREVIEW</span><h2>{selected}</h2><p>ROLE COLLECTION / 2026</p></div><span className="coming-soon-label">ТУН УДАХГҮЙ</span></div><div className="identity-grid">{tiers.map((tier,index)=><article className={`identity-card identity-${tier.color} ${selected===tier.name?"selected":""}`} key={tier.name}><span>{tier.tag}</span><h3>{tier.name}</h3><div className="identity-mark">{String(index+1).padStart(2,"0")}</div><ul>{tier.features.map(feature=><li key={feature}><Icon name="check" size={14}/>{feature}</li>)}</ul><button onClick={()=>setSelected(tier.name)}>{selected===tier.name?"SELECTED":"PREVIEW ROLE"}<Icon name="arrow" size={14}/></button></article>)}</div></main>}
