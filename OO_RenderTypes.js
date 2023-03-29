// Alexandre Cormier 29/03/2023



// WRTIE MANIPULATION


function RenderTypes(){

    this.original_resolution = []
    this.original_enable_states = [true,true]
    this.original_path = ""
    const ASSUMED_EXTENSION = "mp4"
    const ASSUMED_FOV = 41.112
    const MOV_WRITE_STANDARD_NAME = "Top/RENDER_MOV"
    const FRAME_WRITE_STANDARD_NAME = "Top/RENDER_FRAMES"
    const RENDER_BIN_PATH = "P:/pipeline/alexdev/proto/OO_RenderTypes/render_scene.bat"
    const PLAY_BIN_PATH = "P:/pipeline/alexdev/proto/OO_RenderTypes/play_mov.bat"

    this.find_node=function(_node_name){
        var variations = [_node_name,_node_name+"_1",_node_name+"_2"]
        for (var v in variations){
            if(node.type(variations[v])!=""){
                return variations[v]
            }
        }
        return ""
    }

    this.init = function(){
        this.original_resolution = this.get_resolution()
        this.original_enable_states = this.get_enable_states()
        this.original_path = this.get_mov_output_path()
    }

    this.restore_scene = function(){
        this.restore_enable_states()
        this.restore_res()
        //this.set_mov_output_path(this.original_path)
    }

    this.find_frame_write=function(){
        var write = this.find_node(FRAME_WRITE_STANDARD_NAME)
        return write
    }

    this.find_mov_write=function(){
        var write = this.find_node(MOV_WRITE_STANDARD_NAME)
        return write
    }

    this.get_enable_states = function(){
        var enables = [
            node.getEnable(this.find_mov_write()),
            node.getEnable(this.find_frame_write()),
        ]
        return enables
    }

    this.activate_frame_write = function(_flag){node.setEnable(this.find_frame_write(),_flag)}
    this.activate_mov_write= function(_flag){node.setEnable(this.find_mov_write(),_flag)}

    this.restore_enable_states = function(){
        this.activate_mov_write(this.original_enable_states[0])
        this.activate_frame_write(this.original_enable_states[0])
    }    
    //SETTINGS 
    this.get_resolution = function(){
        var res = [
            scene.currentResolutionX(),
            scene.currentResolutionY()
        ]
        return res 
    }

    this.set_resolution = function(_res){
        scene.setDefaultResolution(_res[0],_res[1],ASSUMED_FOV)
    }

    this.multiply_res = function(_factor){
        var old_res = this.get_resolution()
        var new_res = [Math.round(old_res[0]*_factor),Math.round(old_res[1]*_factor)]
        this.set_resolution(new_res)
    }

    this.restore_res = function(){
        this.set_resolution(this.original_resolution)
    }
    
    //RENDER 
    this.render_scene = function(_prefix){

        if(_prefix != ""){
            //this.add_prefix_to_output_path(_prefix)
        }
        scene.saveAll()
        var xstage_path = scene.currentProjectPathRemapped()+"/"+scene.currentVersionName()+".xstage"	
        var args = [RENDER_BIN_PATH,'"'+xstage_path+'"'];
        var command_line = args.join(" ");
        MessageLog.trace(command_line)
		var render_process = new Process2(command_line); 
		render_process.launch();
    }

    this.get_mov_output_path = function(){
        var write = this.find_mov_write()
        if (write == ""){
            return false
        }
        var path = node.getTextAttr(write,0,"MOVIE_PATH")+"."+ASSUMED_EXTENSION
        return path
    }

    this.set_mov_output_path = function(_path){
        var write = this.find_mov_write()
        var path = node.setTextAttr(write,"MOVIE_PATH",0,_path)        
    }

    this.add_prefix_to_output_path = function(_suffix){
        var new_path = this.get_mov_output_path()+_suffix
        this.set_mov_output_path(new_path)
    }

    this.play_mov = function(){
        var path = this.get_mov_output_path()
        var command_line = [PLAY_BIN_PATH,path].join(" ")
		var play = new Process2(command_line); 
        MessageLog.trace("playing "+path)
		play.launchAndDetach();
    }

    this.mov_exists = function(){
        var file = new File(this.get_mov_output_path());
        return file.exists        
    }
}


function RenderTypes_UI (){

    var dialog = new Dialog();
	dialog.title = "RENDER TYPES";
	dialog.width = 200;

    var userType = new ComboBox();
	userType.label = "Types";
	userType.editable = true;
	userType.itemList = ["Video_Third","Video_Quarter","Video_Half","Frames_Full","All"];
	dialog.add( userType );
			
	if (dialog.exec()){
        var RT = new RenderTypes()
        RT.init()
        switch (userType.currentItem){

            case "Video_Half":
                RT.activate_frame_write(false)
                RT.activate_mov_write(true)
                RT.multiply_res(0.5)
                RT.render_scene('_half')
                break

            case "Video_third":
                RT.activate_frame_write(false)
                RT.activate_mov_write(true)
                RT.multiply_res(0.33)
                RT.render_scene('_third')
                break

            case "Video_Quarter":
                RT.activate_frame_write(false)
                RT.activate_mov_write(true)
                RT.multiply_res(0.25)
                RT.render_scene('_quarter')
                break

            case "Frames_Full":
                RT.activate_frame_write(true)
                RT.activate_mov_write(false)
                RT.render_scene("")
                break

            case "All":
                RT.activate_frame_write(true)
                RT.activate_mov_write(true)
                RT.render_scene("")
                break

            default:
                break
                    
        }

        RT.restore_res()
        RT.restore_enable_states()
        if(RT.mov_exists()){
            RT.play_mov()
        }

    }
}




function RenderVideoHalf(){
    var RT = new RenderTypes()
    RT.init()
    RT.activate_frame_write(false)
    RT.activate_mov_write(true)
    RT.multiply_res(0.5)
    RT.render_scene('mov')
    RT.restore_res()
    RT.restore_enable_states()
    RT.play_mov()
}

function RenderVideoQuarter(){
    var RT = new RenderTypes()
    RT.init()
    RT.activate_frame_write(false)
    RT.activate_mov_write(true)
    RT.multiply_res(0.25)
    RT.render_scene('mov')
    RT.restore_res()
    RT.restore_enable_states()
    RT.play_mov()
}



function RenderFramesFull(){
    var RT = new RenderTypes()
    RT.init()
    RT.activate_frame_write(true)
    RT.activate_mov_write(false)
    RT.render_scene()
    RT.restore_enable_states()
    RT.play_mov()
}

function RenderAll(){
    var RT = new RenderTypes()
    RT.init()
    RT.activate_frame_write(true)
    RT.activate_mov_write(true)
    RT.render_scene('mov')
    RT.restore_enable_states()
    RT.play_mov()
}





MessageLog.trace("RENDER TYPES SCRIPTS LOADED")
