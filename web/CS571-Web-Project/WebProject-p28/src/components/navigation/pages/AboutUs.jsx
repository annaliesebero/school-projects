import React from "react";
import { Container, Row, Col } from "react-bootstrap";

export default function AboutUs() {

    return (
       <Container className="py-5 d-flex justify-content-center">
       <div style={{ width: "100%", maxWidth: 1400, display: "grid", gap: "1.5rem" }}>
               <Row className="g-4">
                   {/* Top-left: About OnTrack */}
                   <Col md={6} as="section" className="rounded p-4 mb-4" style={{ background: "#4A8DB8", color: "#000" }} aria-labelledby="about-heading">
                       <h2 id="about-heading" style={{ fontFamily: "var(--font-logo)", fontSize: "2rem", marginBottom: "1rem" }}>
                           <span style={{ color: "white" }}>On</span>
                           <span style={{ color: "#1a1a1a" }}>Track</span>
                       </h2>
                       <p style={{ lineHeight: 1.6 }}>
                           This website is intended as a task management and study helper. Input your tasks and keep track of your progress
                       </p>
                       <p>
                           Tasks are organized into tabs. Each tab can represent a different class, project, or category of tasks, it's up to you! After making tabs, you can add your tasks and move them around.
                       </p>
                       <p> Note: you must be logged in to create tasks.</p>

                        <p><b>WARNING:</b> Usernames and passwords are stored as plaintext for the sake of this project. If you make an account, use a simple, generic password please! </p>

                   </Col>

                     {/* Top-right: Pages */}
                   <Col md={6} as="section" className="rounded p-4 mb-4" style={{ background: "#3D7A2E", color: "#fff" }} aria-labelledby="pages-heading">
                       <h2 id="pages-heading" className="mt-0">Pages</h2>
                           <p><b>Home:</b> Create and organize your tasks. Start by making Tabs based on whatever category you want (e.g. by class, priority, type of task). Then, in each tab, you can create tasks with titles, descriptions, and dates. Tabs and Tasks can be customized with colors. If you change your mind about a task location, feel free to drag it to any other tab. </p>
                           <p><b>Weekly Calendar:</b> View tasks by week. Tasks with specific dates will be automatically displayed in the calendar. The calendar provides a way to visualize your week or month.</p>
                           <p><b>Study Session:</b> Start focused study sessions. Start by adding tasks from your home page into a study session. This allows you to focus on a specific set of tasks for a designated amount of time. Once you start your timer, work on your tasks and check them off as you go, good luck!</p>
                           <p><b>Profile:</b> Manage account info and view monthly activity. This is where you can view your personal information and stats. You can check out your total tasks completed and your most productive days. </p>
                   </Col>
               </Row>

                    <Row className="g-4">
                   {/* Bottom-left: Our Team */}
                   <Col md={6} as="section" className="rounded p-4" style={{ background: "#C67A35", color: "#000" }} aria-labelledby="team-heading">
                       <h2 id="team-heading" className="mt-0">Our Team</h2>
                           <p><b>Annaliese:</b> I'm a senior studying computer science with a minor in data science. I love listening to music, baking, and doing crafts! </p>
                           <p><b>Hudson:</b> I'm a junior studying computer science and i'm in the UW Marching Band. I love movies, music, and sports</p>                   
                   </Col>

                   {/* Bottom-right: Resources */}
                   <Col md={6} as="section" className="rounded p-4" style={{ background: "#6B3D7F", color: "#fff" }} aria-labelledby="resources-heading">
                       <h2 id="resources-heading" className="mt-0">Resources</h2>
                       <p>
                           Button Icons From: https://icons.getbootstrap.com/
                       </p>
                   </Col>
               </Row>
           </div>
       </Container>
    )
}