package web

import (
	"encoding/json"
	"log"
	"time"

	"golang.org/x/net/websocket"
)

type progressMsg struct {
	MsgType   string `json:"msgType"`
	Done      bool   `json:"done"`
	ItemCount int    `json:"itemCount"`
	TotalSize int64  `json:"totalSize"`
}

type dirItem struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
}

type dirMsg struct {
	MsgType string    `json:"msgType"`
	Path    string    `json:"path"`
	Items   []dirItem `json:"items"`
}

type commandMsg struct {
	MsgType string
}

func (ui *UI) handleWs(conn *websocket.Conn) {
	jsonE := json.NewEncoder(conn)
	jsonD := json.NewDecoder(conn)

	progress := ui.analyzer.GetProgress()

	for {
		progress.Mutex.Lock()

		if progress.Done {
			jsonE.Encode(&progressMsg{
				MsgType:   "progress",
				Done:      progress.Done,
				ItemCount: progress.ItemCount,
				TotalSize: progress.TotalSize,
			})
			progress.Mutex.Unlock()
			break
		}

		jsonE.Encode(&progressMsg{
			MsgType:   "progress",
			Done:      progress.Done,
			ItemCount: progress.ItemCount,
			TotalSize: progress.TotalSize,
		})

		progress.Mutex.Unlock()

		time.Sleep(100 * time.Millisecond)
	}

	msg := &dirMsg{
		MsgType: "dir",
		Path:    ui.currentDirPath,
		Items:   make([]dirItem, 0, len(ui.currentDir.Files)),
	}
	for _, item := range ui.currentDir.Files {
		msg.Items = append(msg.Items, dirItem{
			Name: item.Name,
			Size: item.Usage,
		})
	}
	jsonE.Encode(msg)

	for {
		msg := &commandMsg{}
		err := jsonD.Decode(msg)
		if err != nil {
			log.Printf("Error parsing websocket message: %s", err.Error())
			break
		}

		println(msg.MsgType)
	}
}
