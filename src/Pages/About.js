import React from "react";

export default function About() {
  return (
    <div className="about-container" style={{ padding: "20px" }}>
      <h1>About Farmified</h1>

      <h2>Our Mission</h2>
      <p>
        Farmified’s mission is to modernize how farmers track, manage, and 
        understand their operations by providing a simple, intuitive platform 
        that brings real-time insights and organization to everyday farm 
        management tasks. We aim to bridge the gap between traditional 
        agricultural practices and modern technology—making farm data easier 
        to record, access, and use for better decision-making.
      </p>

      <h2>What Farmified Does</h2>
      <ul>
        <li>Store and manage key farm information in one place</li>
        <li>Track livestock, crops, equipment, and harvest data</li>
        <li>Improve organization and farm productivity</li>
        <li>Provide a clean interface for data-driven decisions</li>
      </ul>

      <h2>Contributors</h2>
      <ul>
        <li>Carson Cahoy</li>
        <li>Raja Atul Bhope</li>
        <li>Tristian Christopherson</li>
        <li>Eric Gonzalez</li>
      </ul>
    </div>
  );
}
