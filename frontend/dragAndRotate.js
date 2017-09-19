/**
 * Created by timadamson on 9/13/17.
 */
/**
 * Created by timadamson on 8/23/17.
 */

// Public variables
var downX;
var downY;
var cmdVelTopic;
var twist;
var thetaDown;
var downOnCircle = false;


function init() {
    var arm_div = document.querySelectorAll('.js_arm_div');
    var circles = document.querySelectorAll('circle');
    this.app = new App();
    this.app.coordsListener = new CoordsListener(this.app.ros);
    var self = this;

    app.ros.on('connection', function () {
        console.log("We are connected!");

        app.initRightClickGripper(); // This adds the right click gripper listener
        app.addCloudFreezer();

        arm_div.forEach(function(element)
        {
            element.onmousedown = function (e) {
                e = e || window.event;
                if(e.which == 1) { //This will only be true on a left click
                    downX = e.offsetX;
                    downY = e.offsetY;
                }
            };

            element.onmouseup = function (e) {
                e = e || window.event;
                if(e.which == 1) { //This will only be true on a left click
                    var elementId = (e.target || e.srcElement).parentElement.id;
                    console.log(elementId);
                    var x_pixel = (self.app.backendCameraWidth / self.app.cameraWidth) * (e.offsetX - downX);
                    var y_pixel = (self.app.backendCameraHeight / self.app.cameraHeight) * (e.offsetY - downY);
                    self.app.arm.moveArmByDelta(x_pixel, y_pixel, elementId);
                }
            };

        });

        circles.forEach(function(element){
            element.onmousedown = function (e) {
                downOnCircle = true;
                e = e || window.event;
                if(e.which == 1) {
                    var elementId = (e.target || e.srcElement).parentElement.parentElement.id;
                    console.log("Mouse down on the circle with an id of " + elementId);
                    if(elementId === "camera1"){
                        var deltaX = e.offsetX - self.app.coordsListener.cam1X;
                        var deltaY = e.offsetY - self.app.coordsListener.cam1Y;
                        console.log("deltaX is " + deltaX + " and deltaY is " + deltaY);
                        thetaDown = Math.atan2(deltaY, deltaX);
                        //self.app.arm.orientByTheta(thetaDown, elementId);
                        console.log("Theta is " + thetaDown);
                    }
                    else if (elementId ==="camera2"){
                        var deltaX = e.offsetX - self.app.coordsListener.cam2X;
                        var deltaY = e.offsetY - self.app.coordsListener.cam2Y;
                        console.log("deltaX is " + deltaX + " and deltaY is " + deltaY);
                        console.log("e.offsetY:" + e.offsetY + " and cam2Y:" + self.app.coordsListener.cam2Y);
                        thetaDown = Math.atan2(deltaY, deltaX);
                        //self.app.arm.orientByTheta(thetaDown, elementId);
                        console.log("Theta is " + thetaDown);
                    }
                    else{
                        console.error("Camera name not found")
                    }
                    //var deltaX = e.offsetX - self.app.coordsListener.
                }
            };
            element.onmouseup = function (e) {
                e = e || window.event;
                if(e.which == 1 && downOnCircle) {
                    downOnCircle = false;
                    var elementId = (e.target || e.srcElement).parentElement.parentElement.id;
                    console.log("Mouse up on the circle with an id of " + elementId);
                    if(elementId === "camera1"){
                        var deltaX = e.offsetX - self.app.coordsListener.cam1X;
                        var deltaY = e.offsetY - self.app.coordsListener.cam1Y;
                        console.log("deltaX is " + deltaX + " and deltaY is " + deltaY);
                        var thetaUp = Math.atan2(deltaY, deltaX);
                      
                        self.app.arm.orientByTheta(thetaUp - thetaDown, elementId);

                        console.log("Theta is " + thetaDown);
                    }
                    else if (elementId ==="camera2"){
                        var deltaX = e.offsetX - self.app.coordsListener.cam2X;
                        var deltaY = e.offsetY - self.app.coordsListener.cam2Y;
                        console.log("deltaX is " + deltaX + " and deltaY is " + deltaY);
                        console.log("e.offsetY:" + e.offsetY + " and cam2Y:" + self.app.coordsListener.cam2Y);
                        var thetaUp = Math.atan2(deltaY, deltaX);

                        self.app.arm.orientByTheta(thetaUp - thetaDown, elementId);
                        console.log("Theta is " + thetaDown);

                    }
                    else{
                        console.error("Camera name not found")
                    }
                    //var deltaX = e.offsetX - self.app.coordsListener.
                }
            };
        });
    });

// Publishing a Topic
// ------------------
    cmdVelTopic = new ROSLIB.Topic({
        ros : app.ros,
        name : '/cmd_vel',
        messageType : 'geometry_msgs/Twist'
    });

// These lines create a message that conforms to the structure of the Twist defined in our ROS installation
// It initalizes all properties to zero. They will be set to appropriate values before we publish this message.
    twist = new ROSLIB.Message({
        linear : {
            x : 0.0,
            y : 0.0,
            z : 0.0
        },
        angular : {
            x : 0.0,
            y : 0.0,
            z : 0.0
        }
    });

}





/* This function:
 - retrieves numeric values from the text boxes
 - assigns these values to the appropriate values in the twist message
 - publishes the message to the cmd_vel topic.
 */
function pubMessage() {
    /**
     Set the appropriate values on the twist message object according to values in text boxes
     It seems that turtlesim only uses the x property of the linear object
     and the z property of the angular object
     **/
    var linearX = 0.0;
    var angularZ = 0.0;

    // get values from text input fields. Note for simplicity we are not validating.
    linearX = Number(document.getElementById('linearXText').value);
    angularZ = Number(document.getElementById('angularZText').value);

    // Set the appropriate values on the message object
    twist.linear.x = linearX;
    twist.angular.z = angularZ;

    // Publish the message
    cmdVelTopic.publish(twist);
    //  that.emit('change', twist);
    document.getElementById("demo").innerHTML = "Updated Position";
}